using System;
using FluentValidation;
using Application.Activities.DTOs;

namespace Application.Activities.Validators;

public class BaseActivityValidator<T, TDto> : AbstractValidator<T>
    where TDto : BaseActivityDTO
{
    private readonly Func<T, TDto> _selector;

    public BaseActivityValidator(Func<T, TDto> selector)
    {
        _selector = selector ?? throw new ArgumentNullException(nameof(selector));

        
        RuleFor(x => _selector(x).Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(100).WithMessage("Length too much");

      
        RuleFor(x => _selector(x).Description)
            .NotEmpty().WithMessage("Description is required");

       
        RuleFor(x => _selector(x).Date)
            .Must(date => date > DateTime.UtcNow)
            .WithMessage("Date must be in the future");

       
        RuleFor(x => _selector(x).Category)
            .NotEmpty().WithMessage("Category is required");

        RuleFor(x => _selector(x).City)
            .NotEmpty().WithMessage("City is required");

        RuleFor(x => _selector(x).Venue)
            .NotEmpty().WithMessage("Venue is required");

       
        RuleFor(x => _selector(x).Latitude)
            .InclusiveBetween(-90.0, 90.0)
            .WithMessage("Latitude must be between -90 and 90").NotEmpty().WithMessage("Latitude is required");

        RuleFor(x => _selector(x).Longitude)
            .InclusiveBetween(-180.0, 180.0)
            .WithMessage("Longitude must be between -180 and 180").NotEmpty().WithMessage("Longitude is required");
    }
}
