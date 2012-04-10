<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.baseData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>

<asp:Content ID="indexTitle" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="indexContent" ContentPlaceHolderID="MainContent" runat="server">

<div class="detailPanel">
<% if (Model.Library != null)
   { %>
<% using (Html.BeginForm("EditDatabase", "Home", new { id = Model.Library.Id }, FormMethod.Post))
   { %>
<table>
    <tr>
        <th colspan="2">active database details</th>
    </tr>
    <tr>
        <th>name</th>
        <td><%= Html.TextBox("Name", Model.Library.Name, new { @class = "descInput" })%><br /><br />
            <%= Html.ActionLink("delete database", "DeleteDatabase", "Home", new { id = Model.Library.Id }, new { onclick = string.Format("return confirm('Are you sure you want to delete database \\'{0}\\'?\\r\\n\\r\\nThis can not be un-done.');", Server.HtmlEncode(Model.Library.Name)) })%>
        </td>
    </tr>
    <tr>
        <td colspan="2"><div class="actionPanel"><input type="submit" value="save changes" /></div></td>
    </tr>
</table>
<br />
<%= Html.ActionLink("select another database", "SelectDatabase", "Home")%> 
<% } %>
<% }
   else
   {%>
<% using (Html.BeginForm("SetDatabase", "Home"))
   { %>
<table>
    <tr>
    <th colspan="2">select a database</th>
    </tr>
    <tr>
        <th>databases</th>
        <td>
        <%= Html.DropDownList("databaseId", (SelectList)ViewData["databases"], "[select...]")%>
        </td>
    </tr>
    <tr>
        <td colspan="2">
        <div class="actionPanel"><input type="submit" value="select" /></div>
        </td>
    </tr>
</table>
<br />
<%= Html.ActionLink("create new database", "CreateDatabase", "Home")%>
<% } %>
<%} %>
</div>

</asp:Content>
