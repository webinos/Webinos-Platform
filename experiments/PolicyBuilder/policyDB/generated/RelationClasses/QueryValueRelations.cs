///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: QueryValue. </summary>
	public partial class QueryValueRelations
	{
		/// <summary>CTor</summary>
		public QueryValueRelations()
		{
		}

		/// <summary>Gets all relations of the QueryValueEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();


			toReturn.Add(this.AttributeEntityUsingAttributeId);
			toReturn.Add(this.QueryEntityUsingQueryId);
			return toReturn;
		}

		#region Class Property Declarations



		/// <summary>Returns a new IEntityRelation object, between QueryValueEntity and AttributeEntity over the m:1 relation they have, using the relation between the fields:
		/// QueryValue.AttributeId - Attribute.Id
		/// </summary>
		public virtual IEntityRelation AttributeEntityUsingAttributeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Attribute", false);
				relation.AddEntityFieldPair(AttributeFields.Id, QueryValueFields.AttributeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("QueryValueEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between QueryValueEntity and QueryEntity over the m:1 relation they have, using the relation between the fields:
		/// QueryValue.QueryId - Query.Id
		/// </summary>
		public virtual IEntityRelation QueryEntityUsingQueryId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Query", false);
				relation.AddEntityFieldPair(QueryFields.Id, QueryValueFields.QueryId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("QueryEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("QueryValueEntity", true);
				return relation;
			}
		}

		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
