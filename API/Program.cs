using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Ajout des services pour les contrôleurs
builder.Services.AddControllers();

// Enregistrement du StoreContext avec SQL Server
builder.Services.AddDbContext<StoreContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Enregistrement du repository avec une durée de vie "Scoped"
builder.Services.AddScoped<IProductRepository, ProductRepository>();

var app = builder.Build();



// Pipeline de requêtes HTTP
app.MapControllers();

try
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<StoreContext>();
    
    // Applique automatiquement les migrations en attente et crée la BDD si elle n'existe pas
    await context.Database.MigrateAsync();
    
    // Injecte les données initiales du fichier JSON
    await StoreContextSeed.SeedAsync(context);
}
catch (Exception ex)
{
    Console.WriteLine(ex);
    throw;
}

app.Run();
