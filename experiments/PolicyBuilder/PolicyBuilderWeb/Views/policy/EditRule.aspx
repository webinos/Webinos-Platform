<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.policyData>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">

    <div class="breadcrumb">
        <%= Html.ActionLink("< back to policy","EditPolicy", new { id=Model.PolicyLink.Id }) %>
    </div>

    <h2>edit rule</h2>

    <div class="detailPanel">
        <table>
            <tr>
                <th colspan="2">rule details</th>
            </tr>
            <tr>
                <th>effect</th>
                <td>
                       <% using (Html.BeginForm("SetRuleEffect", "policy", new { id = Model.Rule.Id, linkId = Model.PolicyLink.Id }, FormMethod.Post))
                       { %>
                            <%= Html.DropDownList("EffectId",Model.effects(Model.Rule.EffectId), "[select...]") %>&nbsp;<button type="submit">set</button>
                      <%} %>
                </td>
            </tr>
            <tr>
                <td colspan="2"><%= Model.GetConditionString(Model.Rule.Condition) %></td>
            </tr>
            <tr>
                <td colspan="2" class="actionPanel"><%= Html.ActionLink("edit condition", "EditCondition", new { id = Model.Rule.Condition.Id, linkId = Model.PolicyLink.Id })%></td>
            </tr>
        </table>
    </div>
        
</asp:Content>
