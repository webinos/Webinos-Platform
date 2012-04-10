<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.testData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">

    <h2>query library</h2>

    <div class="detailPanel">
        <table>
        <%
        if (Model.queries.Count > 0)
        {  %>
            <tr>
                <th>query description</th><th>&nbsp;</th>
            </tr>
            <% 
            foreach (QueryEntity cie in Model.queries)
            {
            %>
                <tr>
                    <td><%= cie.Description%></td>
                    <td><%= Html.ActionLink("view", "EditQuery", "test", new { docId = 0, id = cie.Id }, new { title = "view/edit the details of this query" })%> | <%= Html.ActionLink("delete", "DeleteQuery", "test", new { docId = 0, id = cie.Id }, new { onclick = "return confirm('delete this query?');" })%></td>
                </tr>
                
            <%
            }
        } 
        else 
        { %>
            <tr>
            <td colspan="3">there are currently no queries</td>
            </tr>
        <% } %>
        <tr>
            <td colspan="3" class="actionPanel"><%= Html.ActionLink("add query", "CreateQuery", "test", new { docId = 0 }, null) %></td>
        </tr>
        </table>
    </div>

</asp:Content>
