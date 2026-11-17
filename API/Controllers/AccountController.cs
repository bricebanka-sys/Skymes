using System;
using System.Security.Claims;
using API.DTOs;
using API.Extensions;
using Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController(SignInManager<AppUser> signInManager) : ControllerBase
{
  // 1. Enregistrement personnalisé
  [HttpPost("register")]
  public async Task<IActionResult> Register(RegisterDto registerDto)
    {
      var user = new AppUser
      {
          FirstName = registerDto.FirstName,
          LastName = registerDto.LastName,
          Email = registerDto.Email,
          UserName = registerDto.Email // On utilise l'email comme nom d'utilisateur par défaut
      };

      // Création de l'utilisateur via le gestionnaire intégré
      var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);

      if (!result.Succeeded)
      {
        // On boucle sur chaque erreur renvoyée par le gestionnaire d'identité
        foreach (var error in result.Errors)
        {
            // On ajoute l'erreur au dictionnaire d'état du modèle de l'API
            ModelState.AddModelError(error.Code, error.Description);
        }

        // Renvoie une réponse standardisée (ProblemDetails) gérée automatiquement par l'attribut [ApiController]
        return ValidationProblem();
      }
      return Ok();
    }

  // 2. Point de terminaison pour la Déconnexion
  [Authorize]
  [HttpPost("logout")]
  public async Task<IActionResult> Logout()
  {
    // Supprime le cookie d'authentification du navigateur
    await signInManager.SignOutAsync();
    return NoContent();
  }

  // 3. Récupération des informations de l'utilisateur connecté
  [HttpGet("user-info")]
  public async Task<ActionResult> GetUserInfo()
  {
    // Si l'utilisateur n'est pas authentifié, on retourne un contenu vide (évite les erreurs 401 dans la console du navigateur)
    if (User.Identity?.IsAuthenticated == false) return NoContent();

    // Utilisation de la méthode d'extension GetUserByEmail() pour récupérer l'utilisateur directement
    var user = await signInManager.UserManager.GetUserByEmailWithAddress(User);


    return Ok(new
    {
        user.FirstName,
        user.LastName,
        user.Email,
        Address = user.Address.ToDto() // Conversion sécurisée de l'entité en DTO
    });
  }
  
  // 4. Vérification de l'état d'authentification
 [HttpGet("auth-status")]
  public ActionResult GetAuthState()
  {
    return Ok(new { isAuthenticated = User.Identity?.IsAuthenticated ?? false });
  }


  [Authorize]
  [HttpPost("address")]
  public async Task<ActionResult<AddressDto>> CreateOrUpdateAddress(AddressDto addressDto)
  {
      var user = await signInManager.UserManager.GetUserByEmailWithAddress(User);

      if (user.Address == null)
      {
          user.Address = addressDto.ToEntity();
      }
      else
      {
          user.Address.UpdateFromDto(addressDto);
      }

      var result = await signInManager.UserManager.UpdateAsync(user);

      if (!result.Succeeded) return BadRequest("An error occurred during the user address update.");

      return Ok(user.Address.ToDto());
  }


}
