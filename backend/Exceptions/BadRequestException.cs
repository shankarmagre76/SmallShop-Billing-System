namespace SmallShopInventoryBillingAPI.Exceptions;

public class BadRequestException : Exception
{
    public List<string> Errors { get; } = new();

    public BadRequestException(string message) : base(message)
    {
    }

    public BadRequestException(string message, IEnumerable<string> errors) : base(message)
    {
        Errors = errors.ToList();
    }
}
