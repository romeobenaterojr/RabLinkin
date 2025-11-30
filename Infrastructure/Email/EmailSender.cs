using System;
using System.Threading.Tasks;
using Domain;
using Resend;
using Application.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Email
{
    public class EmailSender : IEmailSender<User>
    {
        private readonly IResend _resend;
        private readonly string _verifiedFrom;

        // Updated constructor: takes API key and verified from email
        public EmailSender(string apiKey, string verifiedFrom)
        {
            _resend = ResendClient.Create(apiKey);
            _verifiedFrom = verifiedFrom;
        }

        public async Task SendConfirmationEmailAsync(string toEmail, string? displayName, string confirmationLink)
        {
            var nameToUse = displayName ?? "User";

            var subject = "Confirm your email address";
            var body = $@"
                <h2>Confirm Your Email</h2>
                <p>Hello {nameToUse},</p>
                <p>Please confirm your email by clicking the link below:</p>
                <p><a href='{confirmationLink}'>Click here to verify email</a></p>
                <br/>
                <p>Thank you!</p>
            ";

            await SendAsync(toEmail, subject, body);
        }

        public async Task SendConfirmationLinkAsync(User user, string email, string confirmationLink)
        {
            await SendConfirmationEmailAsync(email, user.DisplayName, confirmationLink);
        }

        public Task SendPasswordResetCodeAsync(User user, string email, string resetCode)
        {
            throw new NotImplementedException();
        }

        public Task SendPasswordResetLinkAsync(User user, string email, string resetLink)
        {
            throw new NotImplementedException();
        }

        private async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            var message = new EmailMessage
            {
                From = _verifiedFrom,  // use verified domain
                Subject = subject,
                HtmlBody = htmlBody
            };
            message.To.Add(toEmail);

            try
            {
                var response = await _resend.EmailSendAsync(message);
                Console.WriteLine($"Email sent via Resend. Response: {response}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email: {ex}");
            }
        }
    }
}
