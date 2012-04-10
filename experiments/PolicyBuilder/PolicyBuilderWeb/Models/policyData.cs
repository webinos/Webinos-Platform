using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using policyDB.EntityClasses;
using System.Text;
using policyDB.CollectionClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;
using policyDB.HelperClasses;
using System.Web.Mvc;
using System.Diagnostics;

namespace PolicyBuilder.Models
{
    public class policyData : baseData
    {
        public const string detailsSaved = "saved";

        private PolicyDocumentCollection m_policyDocuments;
        private EffectCollection m_effects;
        private UriComponentCollection m_uriComponents;
        private CombineModeCollection m_combineModes;
        private PolicyCollection m_allPolicies;
        private PolicyDocumentEntity m_nextDocument;
        private PolicyDocumentEntity m_prevDocument;

        public TargetEntity Target { get; set; }
        public PolicyDocumentEntity PolicyDocument { get; set; }
        public PolicyEntity PolicySet { get; set; }
        public PolicyEntity Policy { get; set; }
        public PolicyLinkEntity PolicyLink { get; set; }
        public DecisionNodeEntity Condition { get; set; }
        public DecisionNodeEntity DecisionNode { get; set; }
        public RuleEntity Rule { get; set; }
        public bool IsDocumentLink { get; set; }

        public PolicyDocumentEntity NextPolicyDocument
        {
            get
            {
                if (m_nextDocument == null)
                {
                    PolicyDocumentCollection policyDocuments = new PolicyDocumentCollection();

                    PredicateExpression pe = new PredicateExpression(PolicyDocumentFields.Name > PolicyDocument.Name);
                    pe.Add(PolicyDocumentFields.LibraryId == PolicyDocument.LibraryId);

                    SortExpression se = new SortExpression(PolicyDocumentFields.Name | SortOperator.Ascending);
                    policyDocuments.GetMulti(pe, 1, se);

                    if (policyDocuments.Count > 0)
                        m_nextDocument = policyDocuments[0];
                    else
                        m_nextDocument = new PolicyDocumentEntity();
                }

                return m_nextDocument;
            }
        }

        public PolicyDocumentEntity PreviousPolicyDocument
        {
            get
            {
                if (m_prevDocument == null)
                {
                    PolicyDocumentCollection policyDocuments = new PolicyDocumentCollection();

                    PredicateExpression pe = new PredicateExpression(PolicyDocumentFields.Name < PolicyDocument.Name);
                    pe.Add(PolicyDocumentFields.LibraryId == PolicyDocument.LibraryId);

                    SortExpression se = new SortExpression(PolicyDocumentFields.Name | SortOperator.Descending);
                    policyDocuments.GetMulti(pe, 1, se);

                    if (policyDocuments.Count > 0)
                        m_prevDocument = policyDocuments[0];
                    else
                        m_prevDocument = new PolicyDocumentEntity();
                }

                return m_prevDocument;
            }
        }

        public PolicyDocumentCollection PolicyDocuments
        {
            get
            {
                if (m_policyDocuments == null)
                {
                    m_policyDocuments = new PolicyDocumentCollection();

                    PredicateExpression pe = new PredicateExpression(PolicyDocumentFields.LibraryId == Library.Id);

                    SortExpression se = new SortExpression(PolicyDocumentFields.Name | SortOperator.Ascending);
                    m_policyDocuments.GetMulti(pe,0,se);
                }
                
                return m_policyDocuments;
            }
        }

        public string GetConditionString(DecisionNodeEntity ce)
        {
            Debug.Assert(ce.Type == constants.conditionType);

            StringBuilder sb = new StringBuilder();

            ce.Children.Sort(DecisionNodeFields.Order.FieldIndex, System.ComponentModel.ListSortDirection.Ascending);
            foreach (DecisionNodeEntity ame in ce.Children)
            {
                if (sb.Length > 0)
                    sb.AppendFormat(" {0} ", ce.CombineAnd ? "and" : "or");
                else
                    sb.Append("(");

                if (ame.Type == constants.conditionType)
                {
                    sb.AppendFormat("{0}", GetConditionString(ame));
                }
                else
                {
                    if (ame.Extra.Length > 0)
                    {
                        if (ame.Attribute.AttributeType.Name == "uri")
                            sb.AppendFormat("{0}.{1} = {2}", ame.Attribute.Name, ame.Extra, GetMatchString(ame));
                        else
                            sb.AppendFormat("{0}:{1} = {2}", ame.Attribute.Name, ame.Extra, GetMatchString(ame));
                    }
                    else
                        sb.AppendFormat("{0} = {1}", ame.Attribute.Name, GetMatchString(ame));
                }
            }

            if (sb.Length == 0)
                sb.Append("always");
            else
                sb.Append(")");

            return sb.ToString();
        }

        public string GetMatchName(DecisionNodeEntity ame)
        {
            string name = string.Empty;

            if (ame.Extra.Length > 0)
            {
                if (ame.Attribute.AttributeType.Name == "uri")
                    name = string.Format("{0}.{1}", ame.Attribute.Name, ame.Extra);
                else
                    name = string.Format("{0}:{1}", ame.Attribute.Name, ame.Extra);
            }
            else
                name = ame.Attribute.Name;

            return name;
        }

        public string GetMatchString(DecisionNodeEntity ame)
        {
            StringBuilder sb = new StringBuilder();

            ame.AttributeValue.Sort(AttributeValueFields.Order.FieldIndex, System.ComponentModel.ListSortDirection.Ascending);
            foreach (AttributeValueEntity ave in ame.AttributeValue)
            {
                if (ave.Literal)
                    sb.Append(ave.Value);
                else
                    sb.AppendFormat("[{0}]", ave.Attribute.Name);
            }

            return sb.ToString();
        }

        public SelectList effects(object selObjId)
        {
            if (m_effects == null)
            {
                m_effects = new EffectCollection();
                SortExpression se = new SortExpression(EffectFields.Name | SortOperator.Ascending);
                m_effects.GetMulti(null, 0, se);
            }

            SelectList selList = new SelectList(m_effects, "Id", "Name", selObjId);
            return selList;
        }

        public SelectList uriComponents(object selObjId)
        {
            if (m_uriComponents == null)
            {
                m_uriComponents = new UriComponentCollection();
                SortExpression se = new SortExpression(UriComponentFields.Name | SortOperator.Ascending);
                m_uriComponents.GetMulti(null, 0, se);
            }

            SelectList selList = new SelectList(m_uriComponents, "Name", "Name", selObjId);
            return selList;
        }

        public SelectList combineModes(object selObjId)
        {
            if (m_combineModes == null)
            {
                m_combineModes = new CombineModeCollection();
                SortExpression se = new SortExpression(CombineModeFields.Name | SortOperator.Ascending);
                m_combineModes.GetMulti(null, 0, se);
            }

            SelectList selList = new SelectList(m_combineModes, "Id", "Name", selObjId);
            return selList;
        }

        public SelectList conditionOperators(object selObjId)
        {
            string sel = (bool)selObjId ? "AND" : "OR";
            SelectList selList = new SelectList(new string[] { "AND", "OR" },sel);
            return selList;
        }

        public PolicyCollection allPolicies
        {
            get
            {
                if (m_allPolicies == null)
                {
                    m_allPolicies = new PolicyCollection();
                    PredicateExpression pe = new PredicateExpression(PolicyFields.Set == false);
                    pe.Add(PolicyFields.LibraryId == Library.Id);
                    pe.Add(PolicyFields.IsLibrary == true);
                    SortExpression se = new SortExpression(PolicyFields.Description | SortOperator.Ascending);
                    m_allPolicies.GetMulti(pe, 0, se);
                }

                return m_allPolicies;
            }
        }

        public SelectList allPoliciesSelect(object selObjId)
        {
            SelectList selList = new SelectList(allPolicies, "Id", "Description", selObjId);
            return selList;
        }

        private string getAttributeMap(string name)
        {
            string map = string.Empty;

            RelationCollection rels = new RelationCollection(AttributeEntity.Relations.AttributeTypeEntityUsingAttributeTypeId);
            PredicateExpression pe = new PredicateExpression(AttributeTypeFields.Name == name);

            StringBuilder sb = new StringBuilder();

            AttributeCollection uris = new AttributeCollection();
            if (uris.GetMulti(pe, rels))
            {
                foreach (AttributeEntity ae in uris)
                {
                    sb.AppendFormat("{0}:true,", ae.Id);
                }
            }

            return string.Format("var {0}Map = {{ {1} }};", name, sb.ToString().Trim(','));
        }

        public string uriAttributeMap
        {
            get
            {
                return getAttributeMap("uri");
            }
        }

        public string paramAttributeMap
        {
            get
            {
                return getAttributeMap("param");
            }
        }
    }
}
