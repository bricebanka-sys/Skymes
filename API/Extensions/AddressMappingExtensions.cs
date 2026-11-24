using System;
using API.DTOs;
using Core.Entities;

namespace API.Extensions;

public static class AddressMappingExtensions
{
    // 1. Convertit une entité Address en AddressDto
    public static AddressDto? ToDto(this Address? address)
    {
        if (address == null) return null;

        return new AddressDto
        {
            Line1 = address.Line1,
            Line2 = address.Line2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country
        };
    }

    // 2. Convertit un AddressDto en une nouvelle entité Address
    public static Address ToEntity(this AddressDto addressDto)
    {
        ArgumentNullException.ThrowIfNull(addressDto);

        return new Address
        {
            Line1 = addressDto.Line1,
            Line2 = addressDto.Line2,
            City = addressDto.City,
            State = addressDto.State ?? string.Empty,
            PostalCode = addressDto.PostalCode,
            Country = addressDto.Country
        };
    }

    // 3. Met à jour une entité Address existante à partir d'un AddressDto
    public static void UpdateFromDto(this Address address, AddressDto addressDto)
    {
        ArgumentNullException.ThrowIfNull(addressDto);
        ArgumentNullException.ThrowIfNull(address);

        address.Line1 = addressDto.Line1;
        address.Line2 = addressDto.Line2;
        address.City = addressDto.City;
        address.State = addressDto.State ?? string.Empty;
        address.PostalCode = addressDto.PostalCode;
        address.Country = addressDto.Country;
    }
}
