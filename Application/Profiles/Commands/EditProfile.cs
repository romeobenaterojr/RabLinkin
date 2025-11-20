using Application.Core;
using Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Commands
{
    public class EditProfile
    {
        // Command: request from client
        public class Command : IRequest<Result<Unit>>
        {
            public string DisplayName { get; set; } = string.Empty;
            public string? Bio { get; set; } // optional
        }

        // Validator: only DisplayName required
        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DisplayName)
                    .NotEmpty()
                    .WithMessage("Display name is required");
            }
        }

        // Handler: update profile
        public class Handler(AppDbContext context, IUserAccessor userAccessor)
            : IRequestHandler<Command, Result<Unit>>
        {
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await userAccessor.GetUserAsync();
                if (user == null)
                    return Result<Unit>.Failure("User not found", 404);

                user.DisplayName = request.DisplayName;
                user.Bio = request.Bio; // optional

                // Only mark as modified if detached
                if (context.Entry(user).State == EntityState.Detached)
                {
                    context.Attach(user);
                    context.Entry(user).State = EntityState.Modified;
                }

                var success = await context.SaveChangesAsync(cancellationToken) > 0;

                return success
                    ? Result<Unit>.Success(Unit.Value)
                    : Result<Unit>.Failure("Failed to update profile", 400);
            }
        }
    }
}
