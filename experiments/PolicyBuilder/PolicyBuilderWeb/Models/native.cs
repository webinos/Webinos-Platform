using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.InteropServices;

namespace PolicyBuilder.Models
{
    public class native
    {
        // exported method of the C/C++ DLL.
        [DllImport("policyShimNoCOM", ExactSpelling = true)]
        public static extern int TestPolicy(string policyXML,string requestXML);
    }
}
