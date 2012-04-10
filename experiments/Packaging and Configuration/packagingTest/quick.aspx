<%@ Page Language="C#" AutoEventWireup="true" CodeFile="quick.aspx.cs" Inherits="quick" EnableViewState="false" %>
<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>quick test</title>
    <style type="text/css">
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
<%= testAll() %>
</body>
</html>
