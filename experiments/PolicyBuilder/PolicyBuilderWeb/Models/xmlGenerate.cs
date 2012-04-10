using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using policyDB.EntityClasses;
using System.Text;
using policyDB.HelperClasses;

namespace PolicyBuilder.Models
{
    public class xmlGenerate
    {
        private int m_indent = 0;

        public string generate(QueryEntity inst)
        {
            StringBuilder sb = new StringBuilder();

            sb.Append("<request>");

            foreach (QueryValueEntity cive in inst.QueryValue)
            {
                generate(sb, cive);
            }

            sb.Append("</request>");

            return sb.ToString();
        }

        private void generate(StringBuilder sb, QueryValueEntity cive)
        {
            if (cive.Extra.Length == 0)
                sb.AppendFormat("<{0}-match attr=\"{1}\" match=\"{2}\" />", cive.Attribute.Context.Name, cive.Attribute.Name, cive.Value);
            else
            {
                if (cive.Attribute.AttributeType.Name == "uri")
                    sb.AppendFormat("<{0}-match attr=\"{1}.{2}\" match=\"{3}\" />", cive.Attribute.Context.Name, cive.Attribute.Name, cive.Extra, cive.Value);
                else
                    sb.AppendFormat("<{0}-match attr=\"{1}:{2}\" match=\"{3}\" />", cive.Attribute.Context.Name, cive.Attribute.Name, cive.Extra, cive.Value);
            }
        }

        public string generate(PolicyDocumentEntity doc)
        {
            StringBuilder sb = new StringBuilder();

            if (doc.PolicyLinkId.HasValue)
            {
                sb.Append("<?xml version=\"1.0\" encoding=\"us-ascii\"?>");
                generate(sb, doc.PolicyLink);
            }

            return sb.ToString();
        }

        private void generate(StringBuilder sb, PolicyLinkEntity policyLink)
        {
            newLine(sb);

            if (policyLink.Policy.Set)
            {
                sb.AppendFormat("<policy-set combine=\"{0}\" id=\"{1}\">", policyLink.Policy.CombineMode.Name, policyLink.Policy.Uid.ToString());
                generate(sb, policyLink.Policy.Target);

                policyLink.Children.Sort(PolicyLinkFields.Order.FieldIndex, System.ComponentModel.ListSortDirection.Ascending);
                foreach (PolicyLinkEntity ple in policyLink.Children)
                {
                    m_indent++;
                    generate(sb, ple);
                    m_indent--;
                }

                newLine(sb);
                sb.Append("</policy-set>");
            }
            else
            {
                sb.AppendFormat("<policy combine=\"{0}\" id=\"{1}\" description=\"{2}\">", policyLink.Policy.CombineMode.Name, policyLink.Policy.Uid.ToString(), HttpUtility.HtmlAttributeEncode(policyLink.Policy.Description));
                generate(sb, policyLink.Policy.Target);

                policyLink.Policy.Rule.Sort(RuleFields.Order.FieldIndex, System.ComponentModel.ListSortDirection.Ascending);
                foreach (RuleEntity re in policyLink.Policy.Rule)
                {
                    m_indent++;
                    generate(sb, re);
                    m_indent--;
                }

                newLine(sb);
                sb.Append("</policy>");
            }
        }

        private void generate(StringBuilder sb, TargetEntity target)
        {
            if (target.ConditionCollectionViaTargetCondition.Count > 0)
            {
                newLine(sb);
                sb.Append("<target>");

                foreach (DecisionNodeEntity ce in target.ConditionCollectionViaTargetCondition)
                {
                    m_indent++;
                    generate(sb, ce, true);
                    m_indent--;
                }

                newLine(sb);
                sb.Append("</target>");
            }
        }

        private void generate(StringBuilder sb, RuleEntity rule)
        {
            newLine(sb);
            sb.AppendFormat("<rule effect=\"{0}\">", rule.Effect.Name);
            if (rule.Condition.Children.Count > 0)
            {
                m_indent++;
                generate(sb, rule.Condition, false);
                m_indent--;
            }
            newLine(sb);
            sb.Append("</rule>");
        }

        private void generate(StringBuilder sb, DecisionNodeEntity match, bool subject)
        {
            if (match.Type == constants.attributeMatchType)
            {
                newLine(sb);
                if (match.Extra.Length == 0)
                    sb.AppendFormat("<{0}-match attr=\"{1}\">", match.Attribute.Context.Name, match.Attribute.Name);
                else
                {
                    if (match.Attribute.AttributeType.Name == "uri")
                        sb.AppendFormat("<{0}-match attr=\"{1}.{2}\">", match.Attribute.Context.Name, match.Attribute.Name, match.Extra);
                    else
                        sb.AppendFormat("<{0}-match attr=\"{1}:{2}\">", match.Attribute.Context.Name, match.Attribute.Name, match.Extra);
                }

                match.AttributeValue.Sort(AttributeValueFields.Order.FieldIndex, System.ComponentModel.ListSortDirection.Ascending);
                foreach (AttributeValueEntity ave in match.AttributeValue)
                {
                    m_indent++;
                    generate(sb, ave);
                    m_indent--;
                }

                sb.AppendFormat("</{0}-match>", match.Attribute.Context.Name);
            }
            else
            {
                if (subject)
                {
                    foreach (DecisionNodeEntity de in match.Children)
                    {
                        newLine(sb);
                        sb.Append("<subject>");
                        m_indent++;
                        generate(sb, de, false);
                        m_indent--;
                        newLine(sb);
                        sb.Append("</subject>");
                    }
                }
                else
                {
                    newLine(sb);
                    if (match.CombineAnd)
                        sb.Append("<condition combine=\"and\">");
                    else
                        sb.Append("<condition combine=\"or\">");

                    foreach (DecisionNodeEntity de in match.Children)
                    {
                        m_indent++;
                        generate(sb, de, false);
                        m_indent--;
                    }

                    newLine(sb);
                    sb.Append("</condition>");
                }
            }
        }

        private void generate(StringBuilder sb, AttributeValueEntity attributeValue)
        {
            if (attributeValue.Literal)
                sb.Append(attributeValue.Value);
            else
                sb.AppendFormat("<{0}-attr attr=\"{1}\" />", attributeValue.Attribute.Context.Name, attributeValue.Attribute.Name);
        }

        private void newLine(StringBuilder sb)
        {
            sb.Append('\n');
            sb.Append('\t', m_indent);
        }
    }
}
