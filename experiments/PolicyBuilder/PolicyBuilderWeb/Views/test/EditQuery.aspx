<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.testData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>
<%@ Import Namespace="PolicyBuilder.Models" %>
<%@ Import Namespace="PolicyBuilder.Controllers" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<script type="text/javascript">
<!--
    $(function() {
        $("#attributeLst").change(selChange);
        selChange();

        var queryId = <%= Model.Query.Id %>;
        $(".policyTest").each(function() {
            var docId = this.id.split('-')[1];
            var url = '<%= Url.Action("TestPolicy", "test") %>';
            $.post(url, { id: docId, queryInstanceId : queryId }, finished, 'json');
        });
    });
        
    function finished(res)
    {
        $("#decision-" + res.docId).attr("class",res.result).html(res.result);
    }

    function selChange() {
        var selected = $("#attributeLst option:selected");
        if (selected.text() == "param")
            $("#extraTxt").show();
        else
            $("#extraTxt").hide();
    }
-->
</script>

    <h2>edit query</h2>

    <div class="breadcrumb">
        <% if (Model.PolicyDocument.IsNew)
           { %>
            <%= Html.ActionLink("< back to query library", "Index", "test")%>
        <% }
           else
           { %>
            <%= Html.ActionLink("< back to policy document", "EditPolicyDoc", "policy", new { id = Model.PolicyDocument.Id }, null)%>
        <% } %>
    </div>

<% using (Html.BeginForm("AddValue","test",new { docId = Model.PolicyDocument.Id, id = Model.Query.Id }, FormMethod.Post))
   { %>
<div style="float:left;width:520px;">
    <div class="detailPanel">
            <table>
                <tr>
                    <th colspan="2">query details</th>
                </tr>
                <tr>
                    <th>description</th>
                    <td>
                        <%= Html.TextBox("description",Model.Query.Description,new { @class="descInput" }) %>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="text-align:right;"><button type="submit">save changes</button></td>
                </tr>
            </table>
    </div>

    <div class="detailPanel">
        <%
            ViewData["docId"] = Model.PolicyDocument.Id;
        %>
        <table>
            <tr>
                <th colspan="2">query attributes</th>
            </tr>
            <tr>
                <th>subject attributes</th>
                <td>
                <%
                    ViewData["queryCol"] = Model.SubjectValues;
                    ViewData["queryTitle"] = "Subject";
                    Html.RenderPartial("QueryList");
                %>
                </td>
            </tr>
            <tr>
                <th>resource attributes</th>
                <td>
                <% 
                    ViewData["queryCol"] = Model.ResourceValues;
                    ViewData["queryTitle"] = "Resource";
                    Html.RenderPartial("QueryList");
                %>
                </td>
            </tr>
            <tr>
                <th>environent attributes</th>
                <td>
                <%
                    ViewData["queryCol"] = Model.EnvironmentValues;
                    ViewData["queryTitle"] = "Environment";
                    Html.RenderPartial("QueryList");
                %>
                </td>
            </tr>
        </table>
    </div>
    <div class="detailPanel">
        <table>
            <tr>
                <th colspan="2">add attribute value<div class="explainer">define the query by setting the required attribute values</div></th>
            </tr>
            <tr>
                <th>attribute</th>
                <td><%= Html.DropDownList("attributeId", Model.allAttributes(null), "[select...]", new { id = "attributeLst" })%> <%= Html.TextBox("extra",null, new { id = "extraTxt" })%></td>
            </tr>
            <tr>
                <th>value</th>
                <td><%= Html.TextBox("attributeValue") %></td>
            </tr>
            <tr>
                <td colspan="2" style="text-align:right;"><button type="submit">add attribute</button></td>
            </tr>
        </table>
    </div>
    <div class="pager">
        <% if (!Model.PreviousQuery.IsNew)
           {%>
            <%= Html.ActionLink("< prev", "EditQuery", new { id = Model.PreviousQuery.Id, docId = Model.PolicyDocument.Id }, new { title = "go to previous query" })%>
        <% } %>
        &nbsp;&nbsp;
        <% if (!Model.NextQuery.IsNew)
           {%>
            <%= Html.ActionLink("next >", "EditQuery", new { id = Model.NextQuery.Id, docId = Model.PolicyDocument.Id }, new { title = "go to next query" })%>
        <% } %>
    </div>
    <div class="">
        <%= Html.ActionLink("add new query", "CreateQuery", "test", new { docId = 0 }, null) %> | <%= Html.ActionLink("duplicate this query", "DuplicateQuery", "test", new { id = Model.Query.Id, docId = 0 }, null) %>
    </div>
</div>

<div style="float:left;">
            <%
            policyData pd = new policyData();
            %>
            <div class="detailPanel">
                <table>
                <tr>
                    <th colspan="3">test results<div class="explainer">below are the results of applying every policy document to this query</div></th>
                </tr>
                <%
                if (pd.PolicyDocuments.Count > 0)
                {  %>
                    <tr>
                        <th>document</th><th>decision</th><th>&nbsp;</th>
                    </tr>
                    <% 
                    foreach (PolicyDocumentEntity pde in pd.PolicyDocuments)
                    {
                    %>
                        <tr>
                            <td><%= pde.Name%></td>
                            <td id="decision-<%= pde.Id %>" class="policyTest" style="color:Black;"><img src="/Content/ajax.gif" /> checking...</td>
                            <td><%= Html.ActionLink("view", "EditPolicyDoc", "policy", new { id = pde.Id }, new { title = "view/edit document" })%> </td>
                        </tr>                        
                    <%
                    }
                } 
                else 
                { %>
                    <tr>
                    <td colspan="3">there are currently no policy documents</td>
                    </tr>
                <% } %>
                <tr>
                    <td colspan="3" class="actionPanel"><%= Html.ActionLink("add document", "EditPolicyDoc", "policy", new { id = 0 }, null) %></td>
                </tr>
                </table>
            </div>
</div>
    <% } %>
</asp:Content>
