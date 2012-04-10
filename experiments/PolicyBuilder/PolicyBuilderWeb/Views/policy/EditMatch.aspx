<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<PolicyBuilder.Models.policyData>" %>
<%@ Import Namespace="policyDB.EntityClasses" %>

<asp:Content ID="Content1" ContentPlaceHolderID="TitleContent" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<script type="text/javascript">
    <%= Model.uriAttributeMap %>
    <%= Model.paramAttributeMap %>
    
    $(function() {
        $("#attributeLst").change(selChange);
        selChange();
    });

    function selChange() {
        $("#uriComponentLst").hide();
        $("#extraTxt").hide();
        var selected = $("#attributeLst option:selected");
        if (paramMap[selected.val()] == true) {
            $("#extraTxt").show();
        }
        else if (uriMap[selected.val()] == true) {
            $("#uriComponentLst").show();
        }
    }
</script>

    <div class="breadcrumb">
        <% if (Model.DecisionNode.Parent.Rule.Count > 0)
           { %>
            <%= Html.ActionLink("< back to rule", "EditRule", new { id = Model.DecisionNode.Parent.Rule[0].Id, linkId = Model.PolicyLink.Id })%>
        <% }
           else if (Model.DecisionNode.Parent.TargetCondition.Count > 0)
           { %>
            <%= Html.ActionLink("< back to target condition", "EditTarget", new { id = Model.DecisionNode.Parent.TargetCondition[0].ConditionId, linkId = Model.PolicyLink.Id })%>
            <% }
           else
           {%>
           <%= Html.ActionLink("< back to parent condition", "EditCondition", new { id = Model.DecisionNode.ParentId, linkId = Model.PolicyLink.Id })%>
           <%}%>
    </div>

    <h2><%= ViewData["title"] %></h2>

<div class="detailPanel">
    <table>
        <tr>
            <th colspan="4">attribute match details</th>
        </tr>
        <tr>
            <th style="width:200px;">attribute<div class="explainer">select the attribute to match against and optionally specify any additional suffix (e.g. host, scheme, parameter name etc)</div></th>
            <th style="text-align:left;">
                <% using (Html.BeginForm("SetAttribute", "policy", new { id = Model.DecisionNode.Id, id2 = Model.DecisionNode.ParentId, linkId = Model.PolicyLink.Id }, FormMethod.Post, null))
                   { %>
                    <%= Html.DropDownList("AttributeId", (SelectList)ViewData["selectList"], "[select...]", new { id = "attributeLst" })%>
                    <%= Html.TextBox("extra", Model.DecisionNode.Extra, new { id = "extraTxt", title="optional attribute suffix, e.g. parameter name or widget value name" })%>
                    <%= Html.DropDownList("uriExtra", Model.uriComponents(Model.DecisionNode.Extra), "[optional...]", new { id = "uriComponentLst", title="optional URI component suffix" })%>
                    &nbsp;<button type="submit" name="update">set</button><div style="font-size:.9em;padding-top:4px;"><a href="javascript:void(0);" id="suffixLnk" style="display:none;">add suffix</a></div>
                <% } %>
            </th>
            <% if (!Model.DecisionNode.IsNew)
            {%>
            <th>order</th>
            <th>&nbsp;</th>
        </tr>
        <%
        foreach (AttributeValueEntity ave in Model.DecisionNode.AttributeValue)
        {
            %>
            <tr>
            <%
            using (Html.BeginForm("UpdateAttributeValue", "policy", new { id = Model.DecisionNode.Id, valueId = ave.Id, linkId = Model.PolicyLink.Id }, FormMethod.Post))
            {
                if (ave.Literal)
                { %>
                    <th style="width:200px;">value<div class="explainer">currently only literal matches and globbing is supported (no regular expressions)</div></th>
                    <td style="text-align:right;">
                    <%= Html.TextBox("Literal", ave.Value, new { id = "val-" + ave.Id.ToString() })%>
                    &nbsp;<button type="submit" name="update">set</button></td>
                    <%
                }
                else
                {
                    %>
                    <th style="width:200px;">value<div class="explainer">the attribute value will be pulled out of the query and used to match</div></th>
                    <td style="text-align:right;">
                    <%= Html.DropDownList("LookupId", Model.allAttributes(ave.AttributeId), "[select...]", new { id = "lookup-" + ave.Attribute.Id.ToString() })%>
                    &nbsp;<button type="submit" name="update">set</button></td>
                    <%
                }
                %>
            <%
            }
            %>
            <td>
                <% using (Html.BeginForm("ValueOrder", "policy", new { id = Model.DecisionNode.Id, id2 = ave.Id, linkId = Model.PolicyLink.Id }, FormMethod.Post))
                   {%>
                <button name="up" type="submit"><img src="/Content/upArrow.png" /></button><button name="down" type="submit"><img src="/Content/downArrow.png" /></button>
                <% } %>
            </td>
            <td>
                <%= Html.ActionLink("delete", "DeleteValue", new { id = Model.DecisionNode.Id, valueId = ave.Id, linkId = Model.PolicyLink.Id })%>
            </td>
            </tr>
            <%
        }
        %>
        <tr>
            <td colspan="4" style="text-align:right;"><%= Html.ActionLink("add literal", "AddValue", "policy", new { id = Model.DecisionNode.Id, literal = true, linkId = Model.PolicyLink.Id }, null)%> | <%= Html.ActionLink("add lookup", "AddValue", "policy", new { id = Model.DecisionNode.Id, literal = false, linkId = Model.PolicyLink.Id }, null)%></td>
        </tr>
<%
   }
   else
   {
       %>
       </tr>
       <%
   } 
%>
    </table>
</div>

</asp:Content>
