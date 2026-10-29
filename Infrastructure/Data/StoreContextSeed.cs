using System;
using System.Text.Json;
using Core.Entities;

namespace Infrastructure.Data;

public class StoreContextSeed
{

  public static async Task SeedAsync(StoreContext context)
    {
        if (!context.Products.Any())
        {
            // Remonte d'un niveau depuis le dossier d'exécution pour trouver le fichier JSON
            var productsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/products.json");

            var products = JsonSerializer.Deserialize<List<Product>>(productsData);

            if (products == null) return;

            context.Products.AddRange(products);

            await context.SaveChangesAsync();
        }
    }

}
