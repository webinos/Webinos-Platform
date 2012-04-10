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
	/// <summary>Implements the static Relations variant for the entity: Attribute. </summary>
	public partial class AttributeRelations
	{
		/// <summary>CTor</summary>
		public AttributeRelations()
		{
		}

		/// <summary>Gets all relations of the AttributeEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();
			toReturn.Add(this.AttributeValueEntityUsingAttributeId);
			toReturn.Add(this.DecisionNodeEntityUsingAttributeId);
			toReturn.Add(this.QueryValueEntityUsingAttributeId);

			toReturn.Add(this.AttributeTypeEntityUsingAttributeTypeId);
			toReturn.Add(this.ContextEntityUsingContextId);
			return toReturn;
		}

		#region Class Property Declarations

		/// <summary>Returns a new IEntityRelation object, between AttributeEntity and AttributeValueEntity over the 1:n relation they have, using the relation between the fields:
		/// Attribute.Id - AttributeValue.AttributeId
		/// </summary>
		public virtual IEntityRelation AttributeValueEntityUsingAttributeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "AttributeValue" , true);
				relation.AddEntityFieldPair(AttributeFields.Id, AttributeValueFields.AttributeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeValueEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between AttributeEntity and DecisionNodeEntity over the 1:n relation they have, using the relation between the fields:
		/// Attribute.Id - DecisionNode.AttributeId
		/// </summary>
		public virtual IEntityRelation DecisionNodeEntityUsingAttributeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "DecisionNode" , true);
				relation.AddEntityFieldPair(AttributeFields.Id, DecisionNodeFields.AttributeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between AttributeEntity and QueryValueEntity over the 1:n relation they have, using the relation between the fields:
		/// Attribute.Id - QueryValue.AttributeId
		/// </summary>
		public virtual IEntityRelation QueryValueEntityUsingAttributeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "QueryValue" , true);
				relation.AddEntityFieldPair(AttributeFields.Id, QueryValueFields.AttributeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("QueryValueEntity", false);
				return relation;
			}
		}


		/// <summary>Returns a new IEntityRelation object, between AttributeEntity and AttributeTypeEntity over the m:1 relation they have, using the relation between the fields:
		/// Attribute.AttributeTypeId - AttributeType.Id
		/// </summary>
		public virtual IEntityRelation AttributeTypeEntityUsingAttributeTypeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "AttributeType", false);
				relation.AddEntityFieldPair(AttributeTypeFields.Id, AttributeFields.AttributeTypeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeTypeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between AttributeEntity and ContextEntity over the m:1 relation they have, using the relation between the fields:
		/// Attribute.ContextId - Context.Id
		/// </summary>
		public virtual IEntityRelation ContextEntityUsingContextId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Context", false);
				relation.AddEntityFieldPair(ContextFields.Id, AttributeFields.ContextId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("ContextEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", true);
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
