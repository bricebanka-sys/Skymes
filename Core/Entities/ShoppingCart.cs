using System;

namespace Core.Entities;

public class ShoppingCart
{
    public required string Id { get; set; } = null!;
    public List<CartItem> Items { get; set; } = [];

}
