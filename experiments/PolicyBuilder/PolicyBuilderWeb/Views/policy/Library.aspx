<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.policyData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server">policy library</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">

    <h2>policy library</h2>

<div class="detailPanel">
        <table>
            <tr><th>policy description</th><th>&nbsp;</th></tr>
    <%
        if (Model.allPolicies.Count > 0)
        {
            foreach (PolicyEntity pe in Model.allPolicies)
            { %>
                <tr>
                    <td><%= pe.Description %></td>
                    <td><%= Html.ActionLink("view","EditPolicyFromLib",new { id = pe.Id }) %> | <%= Html.ActionLink("delete", "DeletePolicyFromLib", new { id = pe.Id }, new { onclick = "return confirm('delete this policy?')" })%></td>
                </tr>
            <% }
        }
        else
        {
           %>
           <tr><td colspan="2">there are currently no policies defined</td></tr>
           <%
        }
        %>
        <tr>
        <td colspan="2" class="actionPanel"><%= Html.ActionLink("add policy","CreatePolicyFromLib") %></td>
        </tr>
        </table>
</div>

</asp:Content>
