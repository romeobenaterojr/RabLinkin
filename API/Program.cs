using API.Middleware;
using API.SignalR;
using Application.Activities.Commands;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Application.Core;
using Application.Interfaces;
using Application.Profiles.Validators;
using Domain;
using FluentValidation;
using Infrastructure.Photos;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// Services
// -----------------------------

// Controllers with default authorization policy
builder.Services.AddControllers(options =>
{
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.Filters.Add(new AuthorizeFilter(policy));
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// CORS (for frontend + SignalR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("https://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// SignalR
builder.Services.AddSignalR();

// MediatR with validation behavior
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining<GetActivityList.Handler>();
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<EditProfileValidator>();

// Scoped / Transient services
builder.Services.AddScoped<IUserAccessor, UserAccessor>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddTransient<ExcemptionMiddleware>();
builder.Services.AddTransient<IAuthorizationHandler, IsHostRequirementHander>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);

// Identity
builder.Services.AddIdentityApiEndpoints<User>(options =>
{
    options.User.RequireUniqueEmail = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>();

// Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("IsActivityHost", policy =>
    {
        policy.Requirements.Add(new IsHostRequirement());
    });
});

// Cloudinary configuration
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("CloudinarySettings")
);

// -----------------------------
// Build application
// -----------------------------
var app = builder.Build();

// -----------------------------
// Middleware pipeline
// -----------------------------
app.UseMiddleware<ExcemptionMiddleware>();

app.UseRouting();

// Apply CORS BEFORE auth & SignalR
app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

// -----------------------------
// Map endpoints
// -----------------------------
app.MapControllers();
app.MapGroup("api").MapIdentityApi<User>();

// SignalR hub (can allow anonymous if desired)
app.MapHub<CommentHub>("/comments");
// app.MapHub<CommentHub>("/hubs/comments");

// -----------------------------
// Database migration & seeding
// -----------------------------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();

        await context.Database.MigrateAsync();
        await DbInitializer.SeedData(context, userManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during migration or seeding.");
    }
}

// -----------------------------
// Run application
// -----------------------------
app.Run();
