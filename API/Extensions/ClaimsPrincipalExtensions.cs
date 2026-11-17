using System;
using System.Security.Authentication;
using System.Security.Claims;
using Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class ClaimsPrincipalExtensions
{

// 1. Méthode d'extension pour récupérer l'e-mail de l'utilisateur connecté
    public static string GetEmail(this ClaimsPrincipal user)
    {
        var email = user.FindFirstValue(ClaimTypes.Email) ?? throw new AuthenticationException("The email claim was not found.");
        return email;
    }

    // 2. Méthode d'extension pour récupérer l'entité AppUser complète depuis le UserManager
    public static async Task<AppUser> GetUserByEmail(this UserManager<AppUser> userManager, ClaimsPrincipal user)
    {
        var email = user.GetEmail();

        var userToReturn = await userManager.Users.FirstOrDefaultAsync(x => x.Email == email) ?? throw new AuthenticationException("User notfound");
        return userToReturn;
    }


    // À ajouter dans ClaimsPrincipalExtensions.cs
    public static async Task<AppUser> GetUserByEmailWithAddress(this UserManager<AppUser> userManager, ClaimsPrincipal user)
    {
        var email = user.GetEmail();

        var userToReturn = await userManager.Users
            .Include(x => x.Address)
            .FirstOrDefaultAsync(x => x.Email == email)
            ?? throw new AuthenticationException("User not found.");

        return userToReturn;
    }

}


