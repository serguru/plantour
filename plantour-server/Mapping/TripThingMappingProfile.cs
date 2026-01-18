using AutoMapper;
using plantour_server.DbModels;
using plantour_server.DTOs;

namespace plantour_server.Mapping;

public class TripThingMappingProfile : Profile
{
    public TripThingMappingProfile()
    {
        _ = CreateMap<TripUserThing, TripThingDto>()
            .ForMember(dest => dest.PackageName, opt => opt.MapFrom(src => src.TripUserPackage != null ? src.TripUserPackage.Name : null))
            .ForMember(dest => dest.PackageLabel, opt => opt.MapFrom(src => src.TripUserPackage != null ? src.TripUserPackage.Label : null))
            .ForMember(dest => dest.IsTargeted, opt => opt.MapFrom(src => src.TripUserPackageId != null))
            .ForMember(dest => dest.TripSharedThingId, opt => opt.MapFrom(x => x.TripSharedThings != null && x.TripSharedThings.Count > 0 ? x.TripSharedThings.First().Id : (Guid?)null))

            .ForMember(dest => dest.AssignedAt, opt => opt.MapFrom(x => x.TripSharedThings != null && x.TripSharedThings.Count > 0 ? DateOnly.FromDateTime(x.TripSharedThings.First().AssignedAt.HasValue ? x.TripSharedThings.First().AssignedAt!.Value : DateTime.MinValue) : (DateOnly?)null))

            .ForMember(dest => dest.AssignedDeadline, opt => opt.MapFrom(x => x.TripSharedThings != null && x.TripSharedThings.Count > 0 ? DateOnly.FromDateTime(x.TripSharedThings.First().AssignedDeadline.HasValue ? x.TripSharedThings.First().AssignedDeadline!.Value : DateTime.MinValue) : (DateOnly?)null));
        
        CreateMap<CreateTripThingRequest, TripUserThing>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackage, opt => opt.Ignore());
        
        CreateMap<UpdateTripThingRequest, TripUserThing>()
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserId, opt => opt.Ignore())
            .ForMember(dest => dest.TripUser, opt => opt.Ignore())
            .ForMember(dest => dest.TripUserPackage, opt => opt.Ignore());
    }
}
