using System;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries
{
    public class GetActivityList
    {


        public class Query : IRequest<Result<PagedList<ActivityDTO, DateTime?>>>
        {
           public required ActivityParams Params { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<PagedList<ActivityDTO, DateTime?>>>
        {
            private readonly AppDbContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            public Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _context = context;
                _mapper = mapper;
                _userAccessor = userAccessor;
            }

            public async Task<Result<PagedList<ActivityDTO, DateTime?>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query = _context.Activities
                    .OrderBy(x => x.Date)
                    .Where(x => x.Date >= (request.Params.Cursor ?? request.Params.StartDate))
                    .AsQueryable();

                if (!string.IsNullOrEmpty(request.Params.Filter))
                {
                    query = request.Params.Filter switch
                    {
                        "IsGoing" => query.Where(x => x.Attendees.Any(a => a.UserId == _userAccessor.GetUserId())),
                        "isHost" => query.Where(x => x.Attendees.Any(a => a.IsHost && a.UserId == _userAccessor.GetUserId())),
                        _ => query
                    };
                }

                var projectedActivities = query.ProjectTo<ActivityDTO>(_mapper.ConfigurationProvider, new
                    {
                        currentUserId = _userAccessor.GetUserId()
                    });

                var activities = await projectedActivities
                    .Take(request.Params.PageSize + 1)         
                    .ToListAsync(cancellationToken);

                DateTime? nextCursor = null;

                if (activities.Count > request.Params.PageSize)
                {
                    nextCursor = activities.Last().Date;
                    activities.RemoveAt(activities.Count - 1);
                }

                var paged = new PagedList<ActivityDTO, DateTime?>
                {
                    Items = activities,
                    NextCursor = nextCursor
                };

                return Result<PagedList<ActivityDTO, DateTime?>>.Success(paged);
            }
        }
    }
}
