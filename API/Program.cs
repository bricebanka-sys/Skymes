using API.Middleware;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

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

// Enregistrement du référentiel générique en mode Scoped
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

// 1. Ajout du service CORS dans les services
builder.Services.AddCors();


// Enregistrement de IConnectionMultiplexer en tant que Singleton pour gérer la connexion Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(config =>
{
    // Récupération de la chaîne de connexion depuis appsettings.json
    var connString = builder.Configuration.GetConnectionString("Redis") 
                     ?? throw new InvalidOperationException("Cannot get Redis connection string.");
    
    // Configuration et connexion à Redis
    var configuration = ConfigurationOptions.Parse(connString, true);
    return ConnectionMultiplexer.Connect(configuration);
});

// Enregistrement du service de panier en tant que Singleton
builder.Services.AddSingleton<ICartService, CartService>();

var app = builder.Build();



// Pipeline de requêtes HTTP
app.UseMiddleware<ExceptionMiddleware>();

// Configuration CORS spécifique pour autoriser Angular (ports 4200 en HTTP et HTTPS)
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
    .WithOrigins("http://localhost:4200", "https://localhost:4200"));

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
