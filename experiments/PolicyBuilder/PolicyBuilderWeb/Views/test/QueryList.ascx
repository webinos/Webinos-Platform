<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
<%@ Import Namespace="policyDB.EntityClasses" %>
<%@ Import Namespace="policyDB.CollectionClasses" %>

<%
    QueryValueCollection coll = (QueryValueCollection)ViewData["queryCol"];
    string title = ViewData["queryTitle"].ToString();
    int docId = (int)ViewData["docId"];
     %>

    <div class="detailPanel">
        <table style="min-width:300px;">
<%--            <tr>
                <th colspan="3"><%= title %> attributes</th>
            </tr>
--%>
        <% if (coll.Count > 0)
           { 
               foreach (QueryValueEntity cive in coll)
               { %>
                    <tr>
                        <td><%= cive.Attribute.Name + (cive.Extra.Length > 0 ? ":" + cive.Extra : "") %></td><td><%= cive.Value%></td><td><%= Html.ActionLink("delete", "DeleteValue", "test", new { id = cive.Id, docId = docId }, null)%></td>
                    </tr>
            <% } 
           } 
           else
           { %>
                <tr>
                    <td colspan="3">no attributes set</td>
                </tr>
        <% } %>
        </table>
    </div>
