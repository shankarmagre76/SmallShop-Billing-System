using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmallShopInventoryBillingAPI.DTOs.Bills;
using SmallShopInventoryBillingAPI.DTOs.Common;
using SmallShopInventoryBillingAPI.Services;

namespace SmallShopInventoryBillingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Staff,Admin")]
public class BillsController : ControllerBase
{
    private readonly IBillingService _billingService;

    public BillsController(IBillingService billingService)
    {
        _billingService = billingService;
    }

    /// <summary>
    /// Creates a new bill with itemized line calculations and automatic stock deduction. (Staff or Admin)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(BillResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ErrorResponse))]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> CreateBill([FromBody] CreateBillRequest request, CancellationToken cancellationToken = default)
    {
        var bill = await _billingService.CreateBillAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetBillById), new { id = bill.Id }, bill);
    }

    /// <summary>
    /// Gets all bill summaries with pagination. (Staff or Admin)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<BillListResponse>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> GetAllBills([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var bills = await _billingService.GetAllBillsAsync(page, pageSize, cancellationToken);
        return Ok(bills);
    }

    /// <summary>
    /// Gets detailed bill information by ID. (Staff or Admin)
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(BillResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> GetBillById(int id, CancellationToken cancellationToken = default)
    {
        var bill = await _billingService.GetBillByIdAsync(id, cancellationToken);
        return Ok(bill);
    }
}
