<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.testData>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
    <script type="text/javascript">
    <!--
        $(function() {
            $("#submitTestBtn").hide();
            $("#queryList").change(selectionChange);
            selectionChange();
        });
        
        function selectionChange() 
        {
            $("#decision").attr("class","decisionPanel").html("select a query");
            var selected = $("#queryList option:selected");
            if (selected.val() != 0) {
                $("#editLnk").show().attr("href", '<%= Url.Action("EditQuery") %>/' + selected.val() + "?docId=<%= Model.PolicyDocument.Id %>");
                
                $("#decision").html("<img src='/content/ajax.gif' /><br /><br />checking...");
                var url = '<%= Url.Action("TestPolicy", "test") %>';
                var id = <%= Model.PolicyDocument.Id %>;
                var queryId = selected.val();
                $.post(url, { id: id, queryInstanceId : queryId }, finished, 'json');
            }
            else {
                $("#editLnk").hide();
            }
        }
        
        function finished(res)
        {
            $("#decision").attr("class","decisionPanel " + res.result);
            $("#decision").html(res.result);
        }
        -->
    </script>

    <h2>test policy document - '<%= Html.ActionLink(Model.PolicyDocument.Name, "EditPolicyDoc", "policy", new { id = Model.PolicyDocument.Id },null)%>'</h2>

<% using (Html.BeginForm("TestPolicyDoc", "test", new { id = Model.PolicyDocument.Id }, FormMethod.Post))
   { %>
    <div class="detailPanel">
        <table>
            <tr>
                <th colspan="2">query</th>
            </tr>
            <tr>
                <th>select<div class="explainer">Select a query to use for the test, or add a new query.</div></th>
                <td>
                    <%= Html.DropDownList("queryInstanceId", Model.queries(Model.Query == null ? 0 : Model.Query.Id), "[select...]", new { id = "queryList"})%>
                    <div class="actionPanel"><a style="display:none;" id="editLnk" href="#">edit request</a> | <%= Html.ActionLink("add request", "CreateQuery", new { docId = Model.PolicyDocument.Id })%></div>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="border:0px;text-align:right;">
                    <button id="submitTestBtn" type="submit">test policy</button>
                </td>
            </tr>
        </table>
    </div>
<% } %>

        <div id="decision" class='decisionPanel <%= TempData["decision"] %>'>
            <%= TempData["decision"] %>
        </div>

    <div class="footerActions">
        <%= Html.ActionLink("edit document","EditPolicyDoc","policy",new { id=Model.PolicyDocument.Id }, null) %>
    </div>
</asp:Content>
