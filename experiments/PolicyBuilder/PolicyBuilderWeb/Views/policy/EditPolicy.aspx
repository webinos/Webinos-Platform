<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.policyData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">

    <div class="breadcrumb">
    <% if (Model.PolicyLink.ParentId.HasValue)
       { %>
        <% if (Model.PolicyLink.Parent.Policy.Set == false)
           { %>
            <%= Html.ActionLink("< back to parent policy", "EditPolicy", new { id = Model.PolicyLink.ParentId.Value })%>
            <%}
           else
           { %>
            <%= Html.ActionLink("< back to parent policy-set", "EditPolicySet", new { id = Model.PolicyLink.ParentId.Value })%>
            <% } %>
    <% }
       else if (Model.PolicyLink.PolicyDocument.Count > 0)
       {%>
            <%= Html.ActionLink("< back to policy document", "EditPolicyDoc", new { id = Model.PolicyLink.PolicyDocument[0].Id })%>       
    <% }
       else
       { %>
            <%= Html.ActionLink("< back to policy library", "Library")%>       
       <% } %>
    </div>

    <h2><%= Model.Policy.Description %> - edit policy</h2>

    <div class="detailPanel">
    
    <% using (Html.BeginForm("PolicyDetailUpdate", "policy", new { id = Model.PolicyLink.Id }, FormMethod.Post))
       { %>
    <table>
        <tr>
            <th colspan="2">policy details</th>
        </tr>
        <tr>
            <th>id</th><td><%= Model.Policy.Uid.ToString() %></td>
        </tr>
        <tr>
            <th>description</th><td><%= Html.TextBox("description", Model.Policy.Description, new { @class = "descInput" })%></td>
        </tr>
        <tr>
            <th>combine rules using</th><td><%= Html.DropDownList("combineModeId", Model.combineModes(Model.Policy.CombineModeId))%></td>
        </tr>
        <tr>
            <td class="actionPanel" colspan="2"><button type="submit">save changes</button></td>
        </tr>
    </table>
    <%} %>
    <% if (!Model.Policy.IsNew)
       { %>
    <br />
    <table>
        <tr>
            <th colspan="2">policy definition<div class="explainer">rules are processed in the order shown using the '<%= Model.Policy.CombineMode.Name %>' combining algorithm</div></th>
        </tr>
        <tr>
            <th>target conditions</th>
            <td>
                <% if (Model.Policy.Target.ConditionCollectionViaTargetCondition.Count > 0)
                   { %>
                <table>
                <% int i = 0;
                   foreach (DecisionNodeEntity ce in Model.Policy.Target.ConditionCollectionViaTargetCondition)
                   {
                        if (i++ > 0)
                        {
                            %>
                            <tr><td colspan="2">or</td></tr>
                            <%
                        }
                        %>
                        <tr>
                            <td><%= Model.GetConditionString(ce)%></td>
                            <td><%= Html.ActionLink("edit", "EditTarget", new { id = ce.Id, linkId = Model.PolicyLink.Id })%> | <%= Html.ActionLink("delete", "DeleteDecisionNode", new { id = ce.Id, linkId = Model.PolicyLink.Id })%></td>
                        </tr>
                    <%} %>
                </table>
                <% }
                   else
                   { %>
                   no conditions - target everything
                <% } %>
                <div class="actionPanel"><%= Html.ActionLink("add condition", "CreateTargetCondition", new { id = Model.Policy.Target.Id, linkId = Model.PolicyLink.Id })%></div>
            </td>
        </tr>
        <tr>
            <th>rules</th>
            <td>
                <% if (Model.Policy.Rule.Count > 0)
                   { %>
                <table>
                <%
                    foreach (RuleEntity re in Model.Policy.Rule)
                    { %>
                    <tr>
                        <td class="<%= re.Effect.Name%>" style="color:Black;"><%= re.Effect.Name%></td>
                        <td><%= Model.GetConditionString(re.Condition)%></td>
                        <td>
                            <% using (Html.BeginForm("RuleOrder", "policy", new { id = re.Id, linkId = Model.PolicyLink.Id }, FormMethod.Post))
                               {%>
                            <button name="up" type="submit"><img src="/Content/upArrow.png" /></button><button name="down" type="submit"><img src="/Content/downArrow.png" /></button>
                            <% } %>
                        </td>
                        <td><%= Html.ActionLink("edit", "EditRule", new { id = re.Id, linkId = Model.PolicyLink.Id })%> | <%= Html.ActionLink("delete", "DeleteRule", new { id = re.Id, linkId = Model.PolicyLink.Id })%></td>
                    </tr>
                <%
                    } %>
                </table>
                <% }
                   else
                   { %>
                   no rules
                <% } %>
                <div class="actionPanel"><%= Html.ActionLink("add rule", "CreateRule", new { id = 0, linkId = Model.PolicyLink.Id })%></div>
            </td>
        </tr>
    </table>
    <% } %>
    </div>
    
</asp:Content>
