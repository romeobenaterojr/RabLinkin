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
using Infrastructure.Email;
using Infrastructure.Photos;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// ===============================================
// SERVICES
// ===============================================

// Controllers (require authentication by default)
builder.Services.AddControllers(opts =>
{
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    opts.Filters.Add(new AuthorizeFilter(policy));
});

// DbContext (SQL Server)
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// CORS (Frontend & SignalR)
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("https://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// SignalR
builder.Services.AddSignalR();

// MediatR + Validation
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining<GetActivityList.Handler>();
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

// ===============================================
// Resend Email Sender (Custom Azure Domain)
// ===============================================
builder.Services.AddTransient<IEmailSender<User>>(sp =>
{
    var apiKey = builder.Configuration["Resend:ApiToken"]!;
    // Use verified Azure domain in EmailSender constructor
    var verifiedFrom = "onboarding@rablinkin.azurewebsites.net";
    return new EmailSender(apiKey, verifiedFrom);
});

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<EditProfileValidator>();

// Dependency Injection - Application Services
builder.Services.AddScoped<IUserAccessor, UserAccessor>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddTransient<ExcemptionMiddleware>();
builder.Services.AddTransient<IAuthorizationHandler, IsHostRequirementHander>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);

// Identity
builder.Services.AddIdentityApiEndpoints<User>(opts =>
{
    opts.User.RequireUniqueEmail = true;
    opts.SignIn.RequireConfirmedEmail = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>();

// Authorization Policy
builder.Services.AddAuthorization(opts =>
{
    opts.AddPolicy("IsActivityHost", policy =>
        policy.Requirements.Add(new IsHostRequirement())
    );
});

// Cloudinary Settings
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("CloudinarySettings")
);

// ===============================================
// BUILD APP
// ===============================================
var app = builder.Build();

// ===============================================
// MIDDLEWARE PIPELINE
// ===============================================
app.UseMiddleware<ExcemptionMiddleware>();

app.UseRouting();
app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

// ===============================================
// ENDPOINTS
// ===============================================
app.MapControllers();
app.MapGroup("api").MapIdentityApi<User>();

// SignalR Hubs
app.MapHub<CommentHub>("/comments");

// Fallback to SPA
app.MapFallbackToController("Index", "Fallback");

// ===============================================
// DB Migration + Seed
// ===============================================
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

// ===============================================
// RUN APP
// ===============================================
app.Run();
