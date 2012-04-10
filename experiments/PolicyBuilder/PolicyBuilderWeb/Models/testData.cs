using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using policyDB.EntityClasses;
using policyDB.CollectionClasses;
using System.Web.Mvc;
using SD.LLBLGen.Pro.ORMSupportClasses;
using policyDB.HelperClasses;

namespace PolicyBuilder.Models
{
    public class testData : baseData
    {
        private QueryCollection m_queries;
        private QueryValueCollection m_environmentValues;
        private QueryValueCollection m_resourceValues;
        private QueryValueCollection m_subjectValues;
        private PolicyDocumentCollection m_policyDocuments;
        private QueryEntity m_nextQuery;
        private QueryEntity m_prevQuery;

        public PolicyDocumentEntity PolicyDocument { get; set; }
        public QueryEntity Query { get; set; }

        public QueryEntity NextQuery
        {
            get
            {
                if (m_nextQuery == null)
                {
                    QueryCollection qcoll = new QueryCollection();

                    PredicateExpression pe = new PredicateExpression(QueryFields.Description > Query.Description);
                    pe.Add(QueryFields.LibraryId == Query.LibraryId);

                    SortExpression se = new SortExpression(QueryFields.Description | SortOperator.Ascending);
                    qcoll.GetMulti(pe, 1, se);

                    if (qcoll.Count > 0)
                        m_nextQuery = qcoll[0];
                    else
                        m_nextQuery = new QueryEntity();
                }

                return m_nextQuery;
            }
        }

        public QueryEntity PreviousQuery
        {
            get
            {
                if (m_prevQuery == null)
                {
                    QueryCollection qcoll = new QueryCollection();

                    PredicateExpression pe = new PredicateExpression(QueryFields.Description < Query.Description);
                    pe.Add(QueryFields.LibraryId == Query.LibraryId);

                    SortExpression se = new SortExpression(QueryFields.Description | SortOperator.Descending);
                    qcoll.GetMulti(pe, 1, se);

                    if (qcoll.Count > 0)
                        m_prevQuery = qcoll[0];
                    else
                        m_prevQuery = new QueryEntity();
                }

                return m_prevQuery;
            }
        }

        public SelectList queriesSelectList(object selObjId)
        {
            SelectList selList = new SelectList(queries, "Id", "Description",selObjId);
            return selList;
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
                    m_policyDocuments.GetMulti(pe, 0, se);
                }

                return m_policyDocuments;
            }
        }

        public QueryCollection queries
        {
            get
            {
                if (m_queries == null)
                {
                    m_queries = new QueryCollection();
                    PredicateExpression pe = new PredicateExpression(QueryFields.LibraryId == Library.Id);
                    SortExpression se = new SortExpression(QueryFields.Description | SortOperator.Ascending);
                    m_queries.GetMulti(pe, 0, se);
                }

                return m_queries;
            }
        }

        private QueryValueCollection getValues(string queryName)
        {
            QueryValueCollection values = new QueryValueCollection();

            RelationCollection rels = new RelationCollection(QueryValueEntity.Relations.QueryEntityUsingQueryId);
            rels.Add(QueryValueEntity.Relations.AttributeEntityUsingAttributeId);
            rels.Add(AttributeEntity.Relations.ContextEntityUsingContextId);

            PredicateExpression pe = new PredicateExpression(QueryValueFields.QueryId == Query.Id);
            pe.Add(ContextFields.Name == queryName);

            values.GetMulti(pe, rels);

            return values;
        }

        public QueryValueCollection EnvironmentValues
        {
            get
            {
                if (m_environmentValues == null)
                {
                    m_environmentValues = getValues("environment");
                }

                return m_environmentValues;
            }
        }

        public QueryValueCollection ResourceValues
        {
            get
            {
                if (m_resourceValues == null)
                {
                    m_resourceValues = getValues("resource");
                }

                return m_resourceValues;
            }
        }

        public QueryValueCollection SubjectValues
        {
            get
            {
                if (m_subjectValues == null)
                {
                    m_subjectValues = getValues("subject");
                }

                return m_subjectValues;
            }
        }
    }
}
