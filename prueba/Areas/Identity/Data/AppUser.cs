using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace prueba.Areas.Identity.Data
{
    // Add profile data for application users by adding properties to the AppUser class
    public class AppUser : IdentityUser
    {
        [PersonalData]
        [Required]
        [Column(TypeName = "nvarchar(100)")]
        [MaxLength(20)]
        public string Nombres { get; set; }

        [PersonalData]
        [Required]
        [Column(TypeName = "nvarchar(100)")]
        [MaxLength(20)]
        public string Apellidos { get; set; }
        public Estado Estado { get; set; }
    }
}
