<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.testData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>
<%@ Import Namespace="PolicyBuilder.Models" %>
<%@ Import Namespace="PolicyBuilder.Controllers" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server">Matrix</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<script type="text/javascript">
<!--
    $(function() {
        $(".policyTest").each(function() {
            var queryId = this.id.split('-')[2];
            var docId = this.id.split('-')[1];
            var url = '<%= Url.Action("TestPolicy", "test") %>';
            $.post(url, { id: docId, queryInstanceId : queryId }, finished, 'json');
        });
    });
        
    function finished(res)
    {
        $("#decision-" + res.docId + "-" + res.cId).attr("class",res.result).html(res.result);
    }
-->
</script>

<h2>test matrix</h2>

<div class="detailPanel">
<table style="font-size:.9em;">
    <tr>
        <td></td>
        <th colspan="<%= Model.queries.Count %>" style="text-align:center;"> queries</th>
    </tr>
    <tr>
        <th>policy documents</th>
        <%
        foreach (QueryEntity qe in Model.queries) 
        { %>
        <th><%= Html.ActionLink(qe.Description, "EditQuery", "test", new { id=qe.Id, docId =0 }, null) %></th>
        <% } %>
    </tr>
<%
    foreach (PolicyDocumentEntity pde in Model.PolicyDocuments)
    { %>
        <tr>
            <th><%= Html.ActionLink(pde.Name, "EditPolicyDoc", "policy", new { id = pde.Id }, null)%></th>
            <% foreach (QueryEntity qe in Model.queries)
               { %>
               <td id="decision-<%= pde.Id %>-<%= qe.Id %>" class="policyTest" style="color:Black;"><img src="/Content/ajax.gif" /></td>
            <% } %>
        </tr>
    <% } %>
</table>
</div>

</asp:Content>
