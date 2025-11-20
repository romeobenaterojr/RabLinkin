using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using Application.Activities.DTOs;
using MediatR;
using Application.Activities.Commands;
using Application.Activities.Queries;

namespace API.SignalR
{
    public class CommentHub(IMediator mediator) : Hub
    {
        private readonly IMediator _mediator = mediator;

        public async Task SendComment(AddComment.Command command)
        {
          

            var comment = await _mediator.Send(command);

            await Clients.Group(command.ActivityId).SendAsync("ReceiveComment", comment.Value);
           
        }

        
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var activityId = httpContext?.Request.Query["activityId"];

            if (string.IsNullOrEmpty(activityId))
                throw new HubException("No activity ID provided.");

  
            await Groups.AddToGroupAsync(Context.ConnectionId, activityId!);

            // Load existing comments and send to the caller
            var result = await _mediator.Send(new GetComment.Query { ActivityId = activityId! });
         
            await Clients.Caller.SendAsync("LoadComments", result.Value);
    

            await base.OnConnectedAsync();
        }

   
       
    }
}
