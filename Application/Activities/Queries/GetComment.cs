using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries
{
    public class GetComment
    {
        // Query: represents request from client
        public class Query : IRequest<Result<List<CommentDTO>>>
        {
            public required string ActivityId { get; set; }
        }

        // Handler: handles the query
        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<List<CommentDTO>>>
        {
            private readonly AppDbContext _context = context;
            private readonly IMapper _mapper = mapper;
        

            public async Task<Result<List<CommentDTO>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var comments = await _context.Comments
                    .Where(x => x.ActivityId == request.ActivityId)
                    .OrderByDescending(x => x.CreatedAt)
                    .ProjectTo<CommentDTO>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);

                return Result<List<CommentDTO>>.Success(comments);
            }
        }
    }
}
