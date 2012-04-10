<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server">import policy document</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">

<% using (Html.BeginForm("Import", "import", FormMethod.Post, new { enctype = "multipart/form-data", id="uploadForm"}))
   { %>
        <input type="file" name="importFile" style="width:300px;" /> <input type="submit" value="upload" />
<% } %>

    <div>
        <%= TempData["error"] %>
    </div>
</asp:Content>
