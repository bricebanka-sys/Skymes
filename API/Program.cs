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

var app = builder.Build();



// Pipeline de requêtes HTTP
app.MapControllers();

app.Run();
