<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.policyData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>
<%@ Import Namespace="PolicyBuilder.Models" %>
<%@ Import Namespace="PolicyBuilder.Controllers" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<script type="text/javascript">
<!--
    $(function() {
            var docId = <%= Model.PolicyDocument.Id %>;
            $(".policyTest").each(function() {
            var queryId = this.id.split('-')[1];
            var url = '<%= Url.Action("TestPolicy", "test") %>';
            $.post(url, { id: docId, queryInstanceId : queryId }, finished, 'json');
            });
        });
        
        function finished(res)
        {
            $("#decision-" + res.cId).attr("class",res.result).html(res.result);
        }
-->
</script>

    <div class="breadcrumb">
        <%= Html.ActionLink("< back to policy documents", "Index", "policy", new { id = Model.PolicyDocument.LibraryId }, null)%>
    </div>

    <h2><%= Model.PolicyDocument.Name %> - policy document</h2>

<div style="float:left;width:520px;">
    <div class="detailPanel">
        <% using (Html.BeginForm("PolicyDocDetailUpdate", "policy", new { id = Model.PolicyDocument.Id }, FormMethod.Post))
           { %>
        <table>
            <tr>
                <th colspan="2">policy document details</th>
            </tr>
            <tr>
                <th>description</th><td><%= Html.TextBox("name",Model.PolicyDocument.Name,new { @class="descInput" }) %></td>
            </tr>
            <tr>
                <td colspan="2" class="actionPanel"><button type="submit">save changes</button></td>
            </tr>
        <% if (!Model.PolicyDocument.PolicyLinkId.HasValue && !Model.PolicyDocument.IsNew)
           { %>
                <tr>
                    <%--<%= Html.ActionLink("add policy","CreateDocumentPolicy", new { id = Model.PolicyDocument.Id }) %>--%>
                    <td colspan="2"><%= Html.ActionLink("add policy","AddPolicy", new { id = Model.PolicyDocument.Id, isDoc = true }) %> | <%= Html.ActionLink("add policy set","CreateDocumentPolicySet", new { id = Model.PolicyDocument.Id }) %></td>
                </tr>
        <% } %>
        </table>
        <%} %>
     </div>

        <%
            if (Model.PolicyDocument.PolicyLinkId.HasValue && !Model.PolicyDocument.IsNew)
            { %>
           <div class="detailPanel">
                <table>
                    <tr>
                        <th colspan="3">document policies</th>
                    </tr>
                    <tr>
                        <th><%= Model.Policy.Set ? "policy-set" : "policy"%></th><td><%= Model.Policy.Description%></td><td><%= Html.ActionLink("edit", Model.Policy.Set ? "EditPolicySet" : "EditPolicy", new { id = Model.PolicyDocument.PolicyLinkId })%> | <%= Html.ActionLink("delete", "ClearPolicyDoc", "policy", new { id = Model.PolicyDocument.Id }, new { onclick = "return confirm('delete this policy?');" })%></td>
                    </tr>
                </table>
           </div>

            <%= Html.ActionLink("download as XML", "downloadPolicyDoc", new { id = Model.PolicyDocument.Id })%><%-- | <%= Html.ActionLink("test policy", "Index", "test", new { id = Model.PolicyDocument.Id }, null) %>--%>

            <div class="pager">
                <% if (!Model.PreviousPolicyDocument.IsNew)
                   {%>
                    <%= Html.ActionLink("< prev", "EditPolicyDoc", new { id = Model.PreviousPolicyDocument.Id }, new { title = "go to previous policy document" })%>
                <% } %>
                &nbsp;&nbsp;
                <% if (!Model.NextPolicyDocument.IsNew)
                   {%>
                    <%= Html.ActionLink("next >", "EditPolicyDoc", new { id = Model.NextPolicyDocument.Id }, new { title = "go to next policy document" })%>
                <% } %>
            </div>

    </div>
    <div style="float:left;">
            
            <%
            testData td = new testData();
            %>
            <div class="detailPanel">
                <table>
                <tr>
                    <th colspan="3">test results<div class="explainer">below are the results of applying this policy document to each of the existing queries</div></th>
                </tr>
                <%
            if (td.queries.Count > 0)
            {  %>
                    <tr>
                        <th>query</th><th>decision</th><th>&nbsp;</th>
                    </tr>
                    <% 
            foreach (QueryEntity cie in td.queries)
            {
                %>
                    <tr>
                        <td><%= cie.Description%></td>
                        <td id="decision-<%= cie.Id %>" class="policyTest" style="color:Black;"><img src="/Content/ajax.gif" /> checking...</td>
                        <td><%= Html.ActionLink("view", "EditQuery", "test", new { docId = Model.PolicyDocument.Id, id = cie.Id }, new { title = "view/edit the details of this query" })%><%-- | <%= Html.ActionLink("delete", "DeleteQuery", "test", new { docId = Model.PolicyDocument.Id, id = cie.Id }, new { onclick = "return confirm('delete this query?');" })%>--%></td>
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
                    <td colspan="3" class="actionPanel"><%= Html.ActionLink("add query", "CreateQuery", "test", new { docId = Model.PolicyDocument.Id }, null)%></td>
                </tr>
                </table>
            </div>
            </div>
    <% }
        else
        {
       %>
           </div>
       <%}%>

</asp:Content>
