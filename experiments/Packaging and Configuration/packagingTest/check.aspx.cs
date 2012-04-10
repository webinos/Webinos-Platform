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
using System.Text;

using packageLib;

public partial class check : System.Web.UI.Page
{
	private string fixUp(string inp)
	{
		return inp == null || inp.Length == 0 ? "&nbsp;" : inp;
	}

	protected string checkConfig()
	{
		StringBuilder sb = new StringBuilder();
		string check = Request.QueryString["w"];

		if (check != null && check.Length > 0)
		{
			packageLib.BondiWidgetClass widget = new BondiWidgetClass();

			sb.Append("<table>");

			try
			{
				string savePath = string.Format("~/w3c-store/test-cases/{0}", check);
				string mapped = Server.MapPath(savePath);

//				mapped = @"C:\dev\bondiWIP\testFramework\w3c-tests\test-cases\" + check;

				string locales = "en";
				if (Request.QueryString["l"] != null)
					locales = Request.QueryString["l"];

				widget.Load(mapped, locales, false);

				sb.AppendFormat("<tr><th>id</th><td>{0}</td></tr>", fixUp(widget.Configuration.Id));
				sb.AppendFormat("<tr><th>version</th><td>{0}</td></tr>", fixUp(widget.Configuration.Version));
				sb.AppendFormat("<tr><th>width</th><td>{0}</td></tr>", (int)widget.Configuration.Width == -1 ? "" : fixUp(widget.Configuration.Width.ToString()));
				sb.AppendFormat("<tr><th>height</th><td>{0}</td></tr>", (int)widget.Configuration.Height == -1 ? "" : fixUp(widget.Configuration.Height.ToString()));
				sb.AppendFormat("<tr><th>name</th><td>{0}</td></tr>", fixUp(widget.Configuration.Name));
				sb.AppendFormat("<tr><th>short name</th><td>{0}</td></tr>", fixUp(widget.Configuration.ShortName));
				sb.AppendFormat("<tr><th>description</th><td>{0}</td></tr>", fixUp(widget.Configuration.Description));
				sb.AppendFormat("<tr><th>author name</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorName));
				sb.AppendFormat("<tr><th>author email</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorEmail));
				sb.AppendFormat("<tr><th>author url</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorURL));
				sb.AppendFormat("<tr><th>license</th><td>{0}</td></tr>", fixUp(widget.Configuration.License));
				sb.AppendFormat("<tr><th>start file</th><td>{0}</td></tr>", fixUp(widget.Configuration.StartFile));
				sb.AppendFormat("<tr><th>view modes</th><td>{0}</td></tr>", fixUp(widget.Configuration.ViewModes));
				sb.AppendFormat("<tr><th>distributor cn</th><td>{0}</td></tr>", fixUp(widget.Configuration.DistributorCommonName));
				sb.AppendFormat("<tr><th>distributor fingerprint</th><td>{0}</td></tr>", fixUp(widget.Configuration.DistributorFingerprint));
				sb.AppendFormat("<tr><th>distributor root cn</th><td>{0}</td></tr>", fixUp(widget.Configuration.DistributorRootCommonName));
				sb.AppendFormat("<tr><th>distributor root fingerprint</th><td>{0}</td></tr>", fixUp(widget.Configuration.DistributorRootFingerprint));
				sb.AppendFormat("<tr><th>author cn</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorCommonName));
				sb.AppendFormat("<tr><th>author fingerprint</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorFingerprint));
				sb.AppendFormat("<tr><th>author root cn</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorRootCommonName));
				sb.AppendFormat("<tr><th>author root fingerprint</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorRootFingerprint));

				for (ushort iconIdx = 0; iconIdx < widget.Configuration.IconCount; iconIdx++)
				{
					string iconPath;
					uint width;
					uint height;
					widget.Configuration.GetIcon(iconIdx, out iconPath, out width, out height);
					sb.AppendFormat("<tr><th>icon</th><td>{0}</td></tr>", fixUp(iconPath));
					if ((int)width >= 0)
						sb.AppendFormat("<tr><th>icon width</th><td>{0}</td></tr>", width);
					if ((int)height >= 0)
						sb.AppendFormat("<tr><th>icon height</th><td>{0}</td></tr>", height);
				}

				for (ushort featureIdx = 0; featureIdx < widget.Configuration.FeatureCount; featureIdx++)
				{
					packageLib.BondiWidgetFeature feature = widget.Configuration.get_Feature(featureIdx);
					sb.AppendFormat("<tr><th>feature</th><td>{0}</td></tr>", feature.Name);
					if (feature.Required)
						sb.AppendFormat("<tr><th>feature required</th><td>yes</td></tr>");
					else
						sb.AppendFormat("<tr><th>feature required</th><td>no</td></tr>");

					for (ushort paramIdx = 0; paramIdx < feature.ParamCount; paramIdx++)
					{
						packageLib.BondiFeatureParam param = feature.get_Param(paramIdx);
						sb.AppendFormat("<tr><th>param name</th><td>{0}</td></tr>", param.Name);
						sb.AppendFormat("<tr><th>param value</th><td>{0}</td></tr>", param.Value);
					}
				}

				for (ushort prefIdx = 0; prefIdx < widget.Configuration.PreferenceCount; prefIdx++)
				{
					packageLib.BondiWidgetPreference pref = widget.Configuration.get_Preference(prefIdx);
					sb.AppendFormat("<tr><th>preference name</th><td>{0}</td></tr>", pref.Name);
					sb.AppendFormat("<tr><th>preference value</th><td>{0}</td></tr>", pref.Value);
					if (pref.ReadOnly)
						sb.AppendFormat("<tr><th>preference readonly</th><td>yes</td></tr>");
					else
						sb.AppendFormat("<tr><th>preference readonly</th><td>no</td></tr>");
				}
			}
			catch (Exception ex)
			{
				sb.AppendFormat("<tr><th>error</th><td>{0}</td></tr>", ex.Message.Replace("\r\n", "<br />"));
			}

			sb.Append("</table>");

			widget = null;
		}
		else
			sb.Append("no file specified");

		return sb.ToString();
	}

	protected void Page_Load(object sender, EventArgs e)
	{
	}
}
