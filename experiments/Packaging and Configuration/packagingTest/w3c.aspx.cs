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
using System.Text;

public partial class w3c : System.Web.UI.Page
{
	class detailData
	{
		public string name;
		public string detail;
		public bool expectPass;
	}

//	const string root = @"D:\home\packaging\w3c-store\test-cases\";
	const string root = @"C:\dev\bondi-1009\testFramework\w3c-tests\test-cases\";
	Dictionary<string, detailData> detailMap = new Dictionary<string, detailData>();

	protected void Page_Load(object sender, EventArgs e)
	{
//		string xmlFile = "~/w3c-store/test-suite.xml";
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
		string locale = localeTxt.Text.Trim();
		if (locale.Length == 0)
			locale = "en";

		string fileKey = fi.FullName.Substring(root.Length).Replace('\\', '/');
		detailData dData = detailMap.ContainsKey(fileKey) ? detailMap[fileKey] : null;
		string detail = dData != null ? dData.detail : string.Format("<span class=\"infoError\">{0} detail info not found in test-suite.xml</span>", fileKey);
		string wUrl = dData != null ? string.Format("check.aspx?w={0}&l={1}", dData.name, locale) : string.Empty;

		try
		{
			packageLib.BondiWidgetClass widget = new BondiWidgetClass();

			string msg = widget.Load(fi.FullName, locale, false);
			if (msg != null && msg.Length > 0)
				throw new Exception(msg);

			string nonNullData = getNonNull(widget);

			if (dData == null || dData.expectPass)
				Response.Write(string.Format("<tr><td class=\"passed\">Valid</td><td>{0}</td><td>{1}</td><td><a href=\"{2}\">{3}</a></td></tr>", detail, nonNullData, wUrl, fileKey));
			else
				Response.Write(string.Format("<tr><td class=\"failed\">Valid</td><td>{0}</td><td>{1}</td><td><a href=\"{2}\">{3}</a></td></tr>", detail, nonNullData, wUrl, fileKey));
		}
		catch (Exception ex)
		{
			if (dData == null || dData.expectPass)
			{
				if (dData == null)
					Response.Write(string.Format("<tr><td class=\"failed\">Invalid</td><td>{0}</td><td>{1}</td><td>{2}</td></tr>", detail, ex.Message, fileKey));
				else
					Response.Write(string.Format("<tr><td class=\"failed\">Invalid</td><td>{0}</td><td>{1}</td><td><a href=\"{2}\">{3}</a></td></tr>", detail, ex.Message, wUrl, fileKey));
			}
			else
				Response.Write(string.Format("<tr><td class=\"passed\">Invalid</td><td>{0}</td><td>{1}</td><td><a href=\"{2}\">{3}</a></td></tr>", detail, ex.Message, wUrl, fileKey));
		}
	}

	private string fixUp(string inp)
	{
		if (inp == null)
			return "<null>";
		else if (inp.Length == 0)
			return "<empty>";
		else
			return string.Format("<pre>'{0}'</pre>", inp);
	}

	private bool wantDisplay(object inp)
	{
		return inp != null;
	}

	private string getNonNull(packageLib.BondiWidgetClass widget)
	{
		StringBuilder sb = new StringBuilder();

		sb.Append("<table>");

		if (wantDisplay(widget.Configuration.Id))
			sb.AppendFormat("<tr><th>id</th><td>{0}</td></tr>", fixUp(widget.Configuration.Id));
		if (wantDisplay(widget.Configuration.Version))
			sb.AppendFormat("<tr><th>version</th><td>{0}</td></tr>", fixUp(widget.Configuration.Version));
		if ((int)widget.Configuration.Width >= 0)
			sb.AppendFormat("<tr><th>width</th><td>{0}</td></tr>", fixUp(widget.Configuration.Width.ToString()));
		if ((int)widget.Configuration.Height >= 0)
			sb.AppendFormat("<tr><th>height</th><td>{0}</td></tr>", fixUp(widget.Configuration.Height.ToString()));
		if (wantDisplay(widget.Configuration.Name))
			sb.AppendFormat("<tr><th>name</th><td>{0}</td></tr>", fixUp(widget.Configuration.Name));
		if (wantDisplay(widget.Configuration.ShortName))
			sb.AppendFormat("<tr><th>short name</th><td>{0}</td></tr>", fixUp(widget.Configuration.ShortName));
		if (wantDisplay(widget.Configuration.Description))
			sb.AppendFormat("<tr><th>description</th><td>{0}</td></tr>", fixUp(widget.Configuration.Description));
		if (wantDisplay(widget.Configuration.AuthorName))
			sb.AppendFormat("<tr><th>author name</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorName));
		if (wantDisplay(widget.Configuration.AuthorEmail))
			sb.AppendFormat("<tr><th>author email</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorEmail));
		if (wantDisplay(widget.Configuration.AuthorURL))
			sb.AppendFormat("<tr><th>author url</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorURL));
		if (wantDisplay(widget.Configuration.LicenseHref))
			sb.AppendFormat("<tr><th>license href</th><td>{0}</td></tr>", fixUp(widget.Configuration.LicenseHref));
		if (wantDisplay(widget.Configuration.LicenseFile))
			sb.AppendFormat("<tr><th>license file</th><td>{0}</td></tr>", fixUp(widget.Configuration.LicenseFile));
		if (wantDisplay(widget.Configuration.License))
			sb.AppendFormat("<tr><th>license</th><td>{0}</td></tr>", fixUp(widget.Configuration.License));
		if (wantDisplay(widget.Configuration.StartFile))
			sb.AppendFormat("<tr><th>start file</th><td>{0}</td></tr>", fixUp(widget.Configuration.StartFile));
		if (wantDisplay(widget.Configuration.StartFileEncoding))
			sb.AppendFormat("<tr><th>start file encoding</th><td>{0}</td></tr>", fixUp(widget.Configuration.StartFileEncoding));
		if (wantDisplay(widget.Configuration.StartFileContentType))
			sb.AppendFormat("<tr><th>start file content type</th><td>{0}</td></tr>", fixUp(widget.Configuration.StartFileContentType));
		if (wantDisplay(widget.Configuration.ViewModes))
			sb.AppendFormat("<tr><th>view modes</th><td>{0}</td></tr>", fixUp(widget.Configuration.ViewModes));	
		if (wantDisplay(widget.Configuration.DistributorCommonName))
			sb.AppendFormat("<tr><th>distributor cn</th><td>{0}</td></tr>", fixUp(widget.Configuration.DistributorCommonName));
		if (wantDisplay(widget.Configuration.DistributorFingerprint))
			sb.AppendFormat("<tr><th>distributor fingerprint</th><td>{0}</td></tr>", fixUp(widget.Configuration.DistributorFingerprint));
		if (wantDisplay(widget.Configuration.DistributorRootCommonName))
			sb.AppendFormat("<tr><th>distributor root cn</th><td>{0}</td></tr>", fixUp(widget.Configuration.DistributorRootCommonName));
		if (wantDisplay(widget.Configuration.DistributorRootFingerprint))
			sb.AppendFormat("<tr><th>distributor root fingerprint</th><td>{0}</td></tr>", fixUp(widget.Configuration.DistributorRootFingerprint));
		if (wantDisplay(widget.Configuration.AuthorCommonName))
			sb.AppendFormat("<tr><th>author cn</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorCommonName));
		if (wantDisplay(widget.Configuration.AuthorFingerprint))
			sb.AppendFormat("<tr><th>author fingerprint</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorFingerprint));
		if (wantDisplay(widget.Configuration.AuthorRootCommonName))
			sb.AppendFormat("<tr><th>author root cn</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorRootCommonName));
		if (wantDisplay(widget.Configuration.AuthorRootFingerprint))
			sb.AppendFormat("<tr><th>author root fingerprint</th><td>{0}</td></tr>", fixUp(widget.Configuration.AuthorRootFingerprint));

		for (ushort iconIdx = 0; iconIdx < widget.Configuration.IconCount; iconIdx++)
		{
			string iconPath;
			uint width;
			uint height;
			widget.Configuration.GetIcon(iconIdx,out iconPath,out width,out height);
			sb.AppendFormat("<tr><th>icon</th><td>{0}</td></tr>", fixUp(iconPath));
			if ((int)width >= 0)
				sb.AppendFormat("<tr><th>icon width</th><td>{0}</td></tr>", width);
			if ((int)height >= 0)
				sb.AppendFormat("<tr><th>icon height</th><td>{0}</td></tr>", height);
		}

		for (ushort featureIdx = 0; featureIdx < widget.Configuration.FeatureCount; featureIdx++)
		{
			packageLib.BondiWidgetFeature feature = widget.Configuration.get_Feature(featureIdx);
			sb.AppendFormat("<tr><th>feature</th><td>{0}</td></tr>", fixUp(feature.Name));
			if (feature.Required)
				sb.AppendFormat("<tr><th>feature required</th><td>yes</td></tr>");
			else
				sb.AppendFormat("<tr><th>feature required</th><td>no</td></tr>");

			for (ushort paramIdx = 0; paramIdx < feature.ParamCount; paramIdx++)
			{
				packageLib.BondiFeatureParam param = feature.get_Param(paramIdx);
				sb.AppendFormat("<tr><th>param name</th><td>{0}</td></tr>", fixUp(param.Name));
				sb.AppendFormat("<tr><th>param value</th><td>{0}</td></tr>", fixUp(param.Value));
			}
		}

		for (ushort prefIdx = 0; prefIdx < widget.Configuration.PreferenceCount; prefIdx++)
		{
			packageLib.BondiWidgetPreference pref = widget.Configuration.get_Preference(prefIdx);
			sb.AppendFormat("<tr><th>preference name</th><td>{0}</td></tr>", fixUp(pref.Name));
			sb.AppendFormat("<tr><th>preference value</th><td>{0}</td></tr>", fixUp(pref.Value));
			if (pref.ReadOnly)
				sb.AppendFormat("<tr><th>preference readonly</th><td>true</td></tr>");
			else
				sb.AppendFormat("<tr><th>preference readonly</th><td>false</td></tr>");
		}

		sb.Append("</table>");

		return sb.ToString();
	}
}
