<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.policyData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>

<asp:Content ID="indexTitle" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="indexContent" ContentPlaceHolderID="MainContent" runat="server">
<script type="text/javascript">
<!--
    $(function() {
        $("#importTable").hide();
        $("#importLnk").show();
        $("#importLnk").click(function() {
            $(this).hide();
            $("#importTable").show();
        });
    });
-->
</script>
<h2>policy documents</h2>

<div class="detailPanel">
    <table>
        <tr>
            <th colspan="2">policy document description</th>
        </tr>
        
    <% 
        if (Model.PolicyDocuments.Count > 0)
        {
            foreach (PolicyDocumentEntity pde in Model.PolicyDocuments)
            {
           %>
           <tr>
           <td><%= pde.Name%></td>
           <td><%--<%= Html.ActionLink("test","Index","test",new { id=pde.Id },null) %> | --%><%= Html.ActionLink("view", "EditPolicyDoc", "policy", new { id = pde.Id }, null)%> | <%= Html.ActionLink("download", "DownloadPolicyDoc", "policy", new { id = pde.Id }, null)%> | <%= Html.ActionLink("delete", "DeletePolicyDoc", "policy", new { id = pde.Id }, new { onclick = "return confirm('delete this policy document?');" })%></td>
           </tr>
           <%
        }
        }
        else
        {
            %>
            <tr>
            <td colspan="2">there are currently no policy documents</td>
            </tr>
    <% } %>
         <tr>
            <td colspan="2" class="actionPanel">
                <%= Html.ActionLink("import webinos SVN", "ImportBondiSVN", "Import", null, new { onclick = string.Format("return confirm('This will delete all policy documents and policies from database \\'{0}\\'.\\r\\n\\r\\nIt will import the policies from http://bondi.omtp.org:8080/svn/bondi/trunk/testframework/tests/policy.\\r\\n\\r\\nAre you sure you want to do this?');", Model.Library.Name) })%> | 
                <a style="display:none;" id="importLnk" href="javascript:void(0);">import document</a> | <%= Html.ActionLink("create document", "EditPolicyDoc", "policy", new { id = 0}, null)%>
            </td>
         </tr>
    </table>
</div>

<div id="importTable" class="detailPanel">
<% using (Html.BeginForm("Import", "import", FormMethod.Post, new { enctype = "multipart/form-data"}))
   { %>
    <table>
        <tr>
            <th colspan="2">import a policy document</th>
        </tr>
        <tr>
            <th>select file</th>
            <td><input type="file" name="importFile" style="width:300px;" /></td>
        </tr>
        <tr>
            <td colspan="2"><div class="actionPanel"><input type="submit" value="import" /></div></td>
        </tr>
    </table>
<% } %>
</div>

    <div>
        <%= TempData["error"] %>
    </div>

</asp:Content>
