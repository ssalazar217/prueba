using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using prueba.Areas.Identity.Data;
using prueba.Data;
using prueba.Models;

namespace prueba.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly AuthDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public HomeController(ILogger<HomeController> logger, AuthDbContext context, UserManager<AppUser> userManager)
        {
            _logger = logger;
            _context = context;
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult info()
        {
            var caso = Request.Form["caso"];
            switch (caso)
            {
                case "Lista Usuarios":
                    ViewBag.ListUsers = _userManager.Users.OrderBy(x => x.Nombres).ToList();
                    ViewBag.Usuarios = _userManager.Users.Count();
                    return View("~/Views/Home/ListUsuarios.cshtml");
                case "Form Veredas":
                    return View("~/Views/Home/ListVeredas.cshtml");
                default:
                    return new EmptyResult();
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }


    }
}
