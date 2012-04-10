<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.policyData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">

    <div class="breadcrumb">
    <% if (Model.PolicyLink.ParentId.HasValue)
       { %>
            <%= Html.ActionLink("< back to parent policy-set", "EditPolicySet", new { id = Model.PolicyLink.ParentId.Value })%>
    <% }
       else if (Model.PolicyLink.PolicyDocument.Count > 0)
       { %>
            <%= Html.ActionLink("< back to policy document", "EditPolicyDoc", new { id = Model.PolicyLink.PolicyDocument[0].Id })%>
    <% } %>
    </div>

    <h2><%= Model.PolicySet.Description %> - edit policy-set</h2>

    <div class="detailPanel">
    <% using (Html.BeginForm("PolicySetDetailUpdate", "policy", new { id = Model.PolicySet.Id, id2= Model.PolicyLink.Id }, FormMethod.Post))
       { %>
    <table>
        <tr>
            <th colspan="2">policy-set details</th>
        </tr>
        <tr>
            <th>id</th><td><%= Model.PolicySet.Uid.ToString() %></td>
        </tr>
        <tr>
            <th>description</th><td><%= Html.TextBox("description",Model.PolicySet.Description,new { @class="descInput" }) %></td>
        </tr>
        <tr>
            <th>combine policies using</th><td><%= Html.DropDownList("combineModeId", Model.combineModes(Model.PolicySet.CombineModeId)) %></td>
        </tr>
        <tr>
            <td colspan="2" class="actionPanel"><button type="submit">save changes</button></td>
        </tr>
    </table>
    <%} %>
    <% if (!Model.PolicySet.IsNew)
       { %>
    <br />
    <table>
        <tr>
            <th colspan="2">policy-set definition<div class="explainer">policies are processed in the order shown using the '<%= Model.PolicySet.CombineMode.Name %>' combining algorithm</div></th>
        </tr>
        <tr>
            <th>target conditions</th>
            <td>
                <% if (Model.PolicySet.Target.ConditionCollectionViaTargetCondition.Count > 0)
                   { %>
                <table>
                <% int i = 0;
                   foreach (DecisionNodeEntity ce in Model.PolicySet.Target.ConditionCollectionViaTargetCondition)
                   {
                        %>
                        
                        <%
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
                <div class="actionPanel"><%= Html.ActionLink("add condition", "CreateTargetCondition", new { id=Model.PolicySet.Target.Id, linkId = Model.PolicyLink.Id })%></div>
            </td>
        </tr>
        <tr>
            <th>policies</th>
            <td>
                <% if (Model.PolicyLink.Children.Count > 0)
                   { %>
                <table>
                <%
                    foreach (PolicyLinkEntity pe in Model.PolicyLink.Children)
                    { %>
                    <tr>
                        <td><%= pe.Policy.Description%></td>
                        <td>
                            <% using (Html.BeginForm("PolicyOrder", "policy", new { id = pe.Id }, FormMethod.Post))
                               {%>
                            <button name="up" type="submit"><img src="/Content/upArrow.png" /></button><button name="down" type="submit"><img src="/Content/downArrow.png" /></button>
                            <% } %>
                        </td>
                        <td>
                            <%= Html.ActionLink("edit", pe.Policy.Set ? "EditPolicySet" : "EditPolicy", new { id = pe.Id })%> | <%= Html.ActionLink("delete", "DeletePolicy", new { id = pe.Id, linkId = Model.PolicyLink.Id })%></td>
                    </tr>
                <%
                    } %>
                </table>
                <% }
                   else
                   { %>
                   no policies
                <% } %>
                <div class="actionPanel"><%= Html.ActionLink("add policy","AddPolicy", new { id = Model.PolicyLink.Id, isDoc = false }) %> | <%= Html.ActionLink("add policy set","CreatePolicySetPolicySet", new { id = Model.PolicyLink.Id }) %></div>
            </td>
        </tr>
    </table>
    <% } %>
    </div>

</asp:Content>
