<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.policyData>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">

<div class="breadcrumb">
    <% if (Model.IsDocumentLink)
       { %>
        <%= Html.ActionLink("< back to policy document", "EditPolicyDoc", new { id = Model.PolicyDocument.Id })%>
        <% }
       else
       { %>
        <%= Html.ActionLink("< back to policy-set", "EditPolicySet", new { id = Model.PolicyLink.Id })%>
       <% } %>
</div>

    <h2>add policy</h2>

<% using (Html.BeginForm("ReferencePolicy", "policy", new { id = Model.IsDocumentLink ? Model.PolicyDocument.Id : Model.PolicyLink.Id, isDoc = Model.IsDocumentLink }, FormMethod.Post))
   { %>
<div class="detailPanel">
    <table>
        <tr>
            <th colspan="2">policy library<div class="explainer">you can reference an existing policy in the policy library, or create a new policy</div></th>
        </tr>
        <tr>
            <th>select from library</th><td><%= Html.DropDownList("libraryPolicyId", Model.allPoliciesSelect(null), "[select...]")%></td>
        </tr>
        <tr>
            <td colspan="2" class="actionPanel"><button type="submit">select</button></td>
        </tr>
    </table>
</div>
<% } %>

<% using (Html.BeginForm("CreatePolicySetPolicy", "policy", new { id = Model.IsDocumentLink ? Model.PolicyDocument.Id : Model.PolicyLink.Id, isDoc = Model.IsDocumentLink }, FormMethod.Post))
   { %>
<div class="detailPanel">
    <table>
        <tr>
            <th colspan="2">create a new policy<div class="explainer">enter a description for the new policy</div></th>
        </tr>
        <tr>
            <th>description</th><td><%= Html.TextBox("description", null, new { @class = "descInput" })%></td>
        </tr>
        <tr>
            <td colspan="2" class="actionPanel"><button type="submit">add policy</button></td>
        </tr>
    </table>
</div>
<% } %>

</asp:Content>
