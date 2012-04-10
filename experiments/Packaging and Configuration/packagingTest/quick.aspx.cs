using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Collections.Generic;
using System.Xml;
using packageLib;

public partial class quick : System.Web.UI.Page
{
    class detailData
    {
        public string name;
        public string detail;
        public bool expectPass;
    }

//    const string root = @"D:\home\packaging\store\";
    const string root = @"C:\dev\bondiWIP\testFramework\w3c-tests\test-cases\";
    Dictionary<string, detailData> detailMap = new Dictionary<string, detailData>();

    protected void Page_Load(object sender, EventArgs e)
    {
        string xmlFile = "~/test-suite.xml";
        XmlDocument doc = new XmlDocument();

        try
        {
            doc.Load(Server.MapPath(xmlFile));

            XmlNodeList tests = doc.SelectNodes("testsuite/test");
            foreach (XmlNode test in tests)
            {
                if (test.Attributes["src"] != null)
                {
                    string src = test.Attributes["src"].Value;
                    detailData dData = new detailData();

                    dData.name = src.Substring("test-cases/".Length);
                    dData.detail = test.InnerText;

                    if (test.Attributes["expected"] != null)
                    {
                        dData.expectPass = test.Attributes["expected"].Value == "pass";
                    }
                    else
                        dData.expectPass = true;

                    detailMap[dData.name] = dData;
                }
            }
        }
        catch (Exception ex)
        {
            Response.Write("Failed to load detail XML: " + Server.MapPath(xmlFile) + "<br />" + ex.ToString());
        }
    }

    protected string testAll()
    {
        try
        {
            Response.Write("<table>");
            Response.Write("<tr><th>result</th><th>detail</th><th>reason</th><th>widget</th></tr>");

            DirectoryInfo di = new DirectoryInfo(root);
            testFolder(di);

            Response.Write("</table>");
        }
        catch (Exception ex)
        {
        }

        return string.Empty;
    }

    private void testFolder(DirectoryInfo di)
    {
        FileInfo[] files = di.GetFiles("*.wgt");
        foreach (FileInfo f in files)
        {
            testFile(f);
        }

        DirectoryInfo[] subFolders = di.GetDirectories();
        foreach (DirectoryInfo sub in subFolders)
        {
            testFolder(sub);
        }
    }

    private void testFile(FileInfo fi)
    {
        string fileKey = fi.FullName.Substring(root.Length).Replace('\\','/');
        detailData dData = detailMap.ContainsKey(fileKey) ? detailMap[fileKey] : null;
        string detail = dData != null ? dData.detail : string.Format("<span class=\"infoError\">{0} detail info not found</span>",fileKey);
        string wUrl = dData != null ? string.Format("check.aspx?w={0}", dData.name) : string.Empty;

        try
        {
            packageLib.BondiWidgetClass widget = new BondiWidgetClass();

            //Response.Write(fi.FullName);

            widget.Load(fi.FullName,"en",false);

            if (dData.expectPass)
                Response.Write(string.Format("<tr><td class=\"passed\">PASSED</td><td>{0}</td><td>&nbsp;</td><td><a href=\"{1}\">{2}</a></td></tr>", detail, wUrl,fileKey));
            else
                Response.Write(string.Format("<tr><td class=\"failed\">FAILED</td><td>{0}</td><td>{1}</td><td><a href=\"{2}\">{3}</a></td></tr>", detail, "Widget loaded but test expected FAIL", wUrl, fileKey));
        }
        catch (Exception ex)
        {
            if (dData == null || dData.expectPass)
            {
                if (dData == null)
                    Response.Write(string.Format("<tr><td class=\"failed\">FAILED</td><td>{0}</td><td>{1}</td><td>{2}</td></tr>", detail, ex.Message, fileKey));
                else
                    Response.Write(string.Format("<tr><td class=\"failed\">FAILED</td><td>{0}</td><td>{1}</td><td><a href=\"{2}\">{3}</a></td></tr>", detail, ex.Message, wUrl, fileKey));
            }
            else
                Response.Write(string.Format("<tr><td class=\"passed\">PASSED</td><td>{0}</td><td>{1}</td><td><a href=\"{2}\">{3}</a></td></tr>", detail, ex.Message, wUrl, fileKey));
        }
    }
}
