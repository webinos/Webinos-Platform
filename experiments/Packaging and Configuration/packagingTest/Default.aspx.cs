using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Text;

using packageLib;

public partial class _Default : System.Web.UI.Page 
{
    protected void Page_Load(object sender, EventArgs e)
    {
        feedbackLbl.Text = string.Empty;
    }

    protected void uploadBtn_Click(object sender, EventArgs e)
    {
        if (fileUpload.HasFile)
        {
            try
            {
                string savePath = string.Format("~/store/{0}", Path.GetFileName(fileUpload.FileName));
                string mapped = Server.MapPath(savePath);
                fileUpload.SaveAs(mapped);

                Response.Redirect(string.Format("~/check.aspx?w={0}", Path.GetFileName(fileUpload.FileName)));
            }
            catch (Exception ex)
            {
                feedbackLbl.Text = ex.Message;
            }
        }
        else
            feedbackLbl.Text = "select a file to upload";
    }
}
