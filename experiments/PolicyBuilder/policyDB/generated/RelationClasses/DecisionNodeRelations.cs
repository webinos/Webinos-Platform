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
	/// <summary>Implements the static Relations variant for the entity: DecisionNode. </summary>
	public partial class DecisionNodeRelations
	{
		/// <summary>CTor</summary>
		public DecisionNodeRelations()
		{
		}

		/// <summary>Gets all relations of the DecisionNodeEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();
			toReturn.Add(this.AttributeValueEntityUsingAttributeMatchId);
			toReturn.Add(this.DecisionNodeEntityUsingParentId);
			toReturn.Add(this.RuleEntityUsingConditionId);
			toReturn.Add(this.TargetConditionEntityUsingConditionId);

			toReturn.Add(this.AttributeEntityUsingAttributeId);
			toReturn.Add(this.DecisionNodeEntityUsingIdParentId);
			return toReturn;
		}

		#region Class Property Declarations

		/// <summary>Returns a new IEntityRelation object, between DecisionNodeEntity and AttributeValueEntity over the 1:n relation they have, using the relation between the fields:
		/// DecisionNode.Id - AttributeValue.AttributeMatchId
		/// </summary>
		public virtual IEntityRelation AttributeValueEntityUsingAttributeMatchId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "AttributeValue" , true);
				relation.AddEntityFieldPair(DecisionNodeFields.Id, AttributeValueFields.AttributeMatchId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeValueEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between DecisionNodeEntity and DecisionNodeEntity over the 1:n relation they have, using the relation between the fields:
		/// DecisionNode.Id - DecisionNode.ParentId
		/// </summary>
		public virtual IEntityRelation DecisionNodeEntityUsingParentId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Children" , true);
				relation.AddEntityFieldPair(DecisionNodeFields.Id, DecisionNodeFields.ParentId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between DecisionNodeEntity and RuleEntity over the 1:n relation they have, using the relation between the fields:
		/// DecisionNode.Id - Rule.ConditionId
		/// </summary>
		public virtual IEntityRelation RuleEntityUsingConditionId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Rule" , true);
				relation.AddEntityFieldPair(DecisionNodeFields.Id, RuleFields.ConditionId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("RuleEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between DecisionNodeEntity and TargetConditionEntity over the 1:n relation they have, using the relation between the fields:
		/// DecisionNode.Id - TargetCondition.ConditionId
		/// </summary>
		public virtual IEntityRelation TargetConditionEntityUsingConditionId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "TargetCondition" , true);
				relation.AddEntityFieldPair(DecisionNodeFields.Id, TargetConditionFields.ConditionId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("TargetConditionEntity", false);
				return relation;
			}
		}


		/// <summary>Returns a new IEntityRelation object, between DecisionNodeEntity and AttributeEntity over the m:1 relation they have, using the relation between the fields:
		/// DecisionNode.AttributeId - Attribute.Id
		/// </summary>
		public virtual IEntityRelation AttributeEntityUsingAttributeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Attribute", false);
				relation.AddEntityFieldPair(AttributeFields.Id, DecisionNodeFields.AttributeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between DecisionNodeEntity and DecisionNodeEntity over the m:1 relation they have, using the relation between the fields:
		/// DecisionNode.ParentId - DecisionNode.Id
		/// </summary>
		public virtual IEntityRelation DecisionNodeEntityUsingIdParentId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Parent", false);
				relation.AddEntityFieldPair(DecisionNodeFields.Id, DecisionNodeFields.ParentId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", true);
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
