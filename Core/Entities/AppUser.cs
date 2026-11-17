using System;
using Microsoft.AspNetCore.Identity;

namespace Core.Entities;

public class AppUser : IdentityUser
{
  public string? FirstName { get; set; }
  public string? LastName { get; set; }
  // Relation 1-à-1 : L'adresse est optionnelle à l'inscription
  public Address? Address { get; set; }
}
