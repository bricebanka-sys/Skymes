using System;
using Core.Entities;
using Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services;

public class PaymentService(IConfiguration config, 
ICartService cartService, 
IGenericRepository<Core.Entities.Product> productRepo, 
IGenericRepository<DeliveryMethod> dmRepo) : IPaymentService
{
  public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
  {
    StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];

      var cart = await cartService.GetCartAsync(cartId);
      if (cart is null) return null;

      var shippingPrice = 0m;

      if (cart.DeliveryMethodId.HasValue)
      {
          var deliveryMethod = await dmRepo.GetByIdAsync((int)cart.DeliveryMethodId);
          if (deliveryMethod is null) return null;

          shippingPrice = deliveryMethod.Price;
      }

      foreach (var item in cart.Items)
      {
          var productItem = await productRepo.GetByIdAsync(item.ProductId);
          if (productItem is null) return null;

          if (item.Price != productItem.Price)
          {
              item.Price = productItem.Price;
          }
      }

      var paymentIntentService = new PaymentIntentService();
      PaymentIntent? intent = null;

      var amount = (long)cart.Items.Sum(x => x.Quantity * (x.Price * 100))
                  + (long)(shippingPrice * 100);

      if (string.IsNullOrEmpty(cart.PaymentIntentId))
      {
          var options = new PaymentIntentCreateOptions
          {
              Amount = amount,
              Currency = "eur",
              PaymentMethodTypes = ["card"]
          };

          intent = await paymentIntentService.CreateAsync(options);
          cart.PaymentIntentId = intent.Id;
          cart.ClientSecret = intent.ClientSecret;
      }
      else
      {
         // Ajustement ici : repli sur CreateAsync si le PaymentIntent existant est introuvable chez Stripe
          try
          {
              var options = new PaymentIntentUpdateOptions
              {
                  Amount = amount
              };

              intent = await paymentIntentService.UpdateAsync(cart.PaymentIntentId, options);
          }
          catch (StripeException)
          {
              cart.PaymentIntentId = null;
              cart.ClientSecret = null;

              var createOptions = new PaymentIntentCreateOptions
              {
                  Amount = amount,
                  Currency = "eur",
                  PaymentMethodTypes = ["card"]
              };

              intent = await paymentIntentService.CreateAsync(createOptions);
              cart.PaymentIntentId = intent.Id;
              cart.ClientSecret = intent.ClientSecret;
          }
      }

      await cartService.SetCartAsync(cart);

      return cart;
  }
}
