<%@ Page Language="C#" AutoEventWireup="true"  CodeFile="Default.aspx.cs" Inherits="_Default" EnableViewState="false" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>upload widget</title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
        <asp:FileUpload ID="fileUpload" runat="server" Width="400px" />
        <br />
        <asp:Button ID="uploadBtn" runat="server" OnClick="uploadBtn_Click" Text="Upload" /><br />
        <asp:Label ID="feedbackLbl" runat="server" />
    </div>
    </form>
</body>
</html>
