using System;
using System.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.CommandLine;

namespace productionManagerCockpit
{
    public class Program
    {

        public static void Main(string[] args)
        {
            var config = new ConfigurationBuilder()
                .AddCommandLine(args)
                .Build();

            var host = new WebHostBuilder()
                .UseConfiguration(config)
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseWebRoot(Path.Combine(Directory.GetCurrentDirectory(), ".", "www"))
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }
    }
}
