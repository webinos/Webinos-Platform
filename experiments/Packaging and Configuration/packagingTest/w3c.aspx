<%@ Page Language="C#" AutoEventWireup="true" CodeFile="w3c.aspx.cs" Inherits="w3c" EnableViewState="false" %>
<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>Bondi compliance with w3c test cases</title>
    <style type="text/css">
    pre
    {
    margin:0;
    }
    th
    {
        border: 1px solid #999;
        background-color: #999;
    }
    td
    {
        border: 1px solid #999;
    }
    .failed
    {
        background-color: red;
    }
    .passed
    {
        background-color: green;
    }
    .infoError
    {
        color: red;
    }
    </style>
</head>
<body>
<form runat="server">
Locale list: <asp:TextBox ID="localeTxt" runat="server" Text="en" /> <asp:Button ID="refreshBtn" runat="server" Text="refresh" />
</form>
<%= testAll() %>
</body>
</html>
