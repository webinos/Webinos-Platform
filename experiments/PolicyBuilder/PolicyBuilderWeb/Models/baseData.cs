using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SD.LLBLGen.Pro.ORMSupportClasses;
using policyDB.CollectionClasses;
using policyDB.HelperClasses;
using System.Web.Mvc;
using policyDB.EntityClasses;

namespace PolicyBuilder.Models
{
    public class baseData
    {
        private AttributeCollection m_allAttributes;
        private AttributeCollection m_subjectAttributes;
        private LibraryEntity m_library;

        public LibraryEntity Library 
        {
            get
            {
                if (m_library == null)
                {
                    int parse;
                    HttpCookie ck = HttpContext.Current.Request.Cookies["dbId"];
                    if (ck != null && int.TryParse(ck.Value,out parse))
                        m_library = new LibraryEntity(parse);
                }

                return m_library;
            }
            set
            {
                m_library = value;
                HttpContext.Current.Response.Cookies["dbId"].Value = m_library.Id.ToString();
            }
        }

        public SelectList allAttributes(object selObjId)
        {
            if (m_allAttributes == null)
            {
                m_allAttributes = new AttributeCollection();
                SortExpression se = new SortExpression(AttributeFields.Name | SortOperator.Ascending);
                m_allAttributes.GetMulti(null, 0, se);
            }

            SelectList selList = new SelectList(m_allAttributes, "Id", "Name", selObjId);
            return selList;
        }

        public SelectList subjectAttributes(object selObjId)
        {
            if (m_subjectAttributes == null)
            {
                m_subjectAttributes = new AttributeCollection();
                RelationCollection rels = new RelationCollection(AttributeEntity.Relations.ContextEntityUsingContextId);
                PredicateExpression pe = new PredicateExpression(ContextFields.Name == "subject");
                SortExpression se = new SortExpression(AttributeFields.Name | SortOperator.Ascending);
                m_subjectAttributes.GetMulti(pe, 0, se, rels);
            }

            SelectList selList = new SelectList(m_subjectAttributes, "Id", "Name", selObjId);
            return selList;
        }
    }
}
