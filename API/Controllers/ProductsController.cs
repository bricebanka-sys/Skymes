using System;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
  private readonly StoreContext context;

  public ProductsController(StoreContext context)
  {
    this.context = context;
    
  }

  [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        return await context.Products.ToListAsync();
    }

    [HttpGet("{id:int}")] //api/products/2
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await context.Products.FindAsync(id);

        if (product == null) return NotFound();

        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        context.Products.Add(product);
        await context.SaveChangesAsync();

        return product;
    }


    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, Product product)
    {
        if (product.Id != id || !ProductExists(id))
            return BadRequest("Unable to update this product.");

        context.Entry(product).State = EntityState.Modified;

        if (await context.SaveChangesAsync() > 0)
        {
            return NoContent();
        }

        return BadRequest("An error occurred while updating the product.");
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await context.Products.FindAsync(id);

        if (product == null) return NotFound();

        context.Products.Remove(product);

        if (await context.SaveChangesAsync() > 0)
        {
            return NoContent();
        }

        return BadRequest("An error occurred while updating the product.");
    }

    private bool ProductExists(int id)
    {
        return context.Products.Any(x => x.Id == id);
    }
}
