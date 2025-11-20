using Application.Activities.DTOs;
using Application.Activities.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CommentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<CommentDTO>>> Get(string activityId)
    {
        var result = await _mediator.Send(new GetComment.Query { ActivityId = activityId });
        return Ok(result.Value);
    }
}
